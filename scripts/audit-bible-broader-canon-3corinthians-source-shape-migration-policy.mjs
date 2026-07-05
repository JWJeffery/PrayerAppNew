import fs from "node:fs";
import crypto from "node:crypto";

const failures = [];

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

function requireEqual(label, actual, expected) {
  if (actual !== expected) failures.push({ type: "mismatch", label, actual, expected });
}

function requireFalse(label, actual) {
  if (actual !== false) failures.push({ type: "not-false", label, actual });
}

function requireTrue(label, actual) {
  if (actual !== true) failures.push({ type: "not-true", label, actual });
}

function requireIncludes(label, list, value) {
  if (!Array.isArray(list) || !list.includes(value)) {
    failures.push({ type: "missing-list-value", label, value });
  }
}

const policy = read(policyPath);
const rowShape = read(rowShapePath);
const sourceSelection = read(sourceSelectionPath);
const governance = read(governancePath);
const classification = read(classificationPath);
const blocker = read(blockerPath);
const currentCandidateSha = sha256File(candidatePath);

requireEqual("policy.status", policy.status, "policy_recorded_rebuild_required_before_candidate_repair");
requireEqual("policy.observedMismatch.activeCandidateRows", policy.observedMismatch?.activeCandidateRows, 19);
requireEqual("policy.observedMismatch.sourceMarkerTotal", policy.observedMismatch?.sourceMarkerTotal, 35);
requireEqual("policy.observedMismatch.simpleOverlayAllowed", policy.observedMismatch?.simpleOverlayAllowed, false);
requireEqual("policy.migrationDecision.currentCandidateDisposition", policy.migrationDecision?.currentCandidateDisposition, "quarantined_related_but_not_exact_not_app_render_eligible");
requireTrue("policy.trustBoundary.sourceShapeMigrationAuthorizedForFutureCommand", policy.trustBoundary?.sourceShapeMigrationAuthorizedForFutureCommand);
requireFalse("policy.trustBoundary.candidateBibleTextMutated", policy.trustBoundary?.candidateBibleTextMutated);
requireFalse("policy.trustBoundary.candidateTextTrusted", policy.trustBoundary?.candidateTextTrusted);
requireFalse("policy.trustBoundary.trustPromotion", policy.trustBoundary?.trustPromotion);
requireFalse("policy.trustBoundary.appRenderPromotion", policy.trustBoundary?.appRenderPromotion);
requireEqual("policy.trustBoundary.candidateSha256Before", policy.trustBoundary?.candidateSha256Before, currentCandidateSha);
requireEqual("policy.trustBoundary.candidateSha256After", policy.trustBoundary?.candidateSha256After, currentCandidateSha);

requireEqual("rowShape.latestSourceShapeMigrationPolicy.recordPath", rowShape.latestSourceShapeMigrationPolicy?.recordPath, policyPath);
requireFalse("rowShape.latestSourceShapeMigrationPolicy.candidateTextMutation", rowShape.latestSourceShapeMigrationPolicy?.candidateTextMutation);
requireFalse("rowShape.latestSourceShapeMigrationPolicy.trustPromotion", rowShape.latestSourceShapeMigrationPolicy?.trustPromotion);
requireFalse("rowShape.latestSourceShapeMigrationPolicy.appRenderPromotion", rowShape.latestSourceShapeMigrationPolicy?.appRenderPromotion);

requireEqual("sourceSelection.latestSourceShapeMigrationPolicy.recordPath", sourceSelection.latestSourceShapeMigrationPolicy?.recordPath, policyPath);
requireFalse("sourceSelection.latestSourceShapeMigrationPolicy.candidateTextMutation", sourceSelection.latestSourceShapeMigrationPolicy?.candidateTextMutation);
requireFalse("sourceSelection.latestSourceShapeMigrationPolicy.trustPromotion", sourceSelection.latestSourceShapeMigrationPolicy?.trustPromotion);
requireFalse("sourceSelection.latestSourceShapeMigrationPolicy.appRenderPromotion", sourceSelection.latestSourceShapeMigrationPolicy?.appRenderPromotion);

requireEqual("governance.latest3CorinthiansSourceShapeMigrationPolicy.recordPath", governance.latest3CorinthiansSourceShapeMigrationPolicy?.recordPath, policyPath);
requireTrue("governance.latest3CorinthiansSourceShapeMigrationPolicy.sourceShapeMigrationAuthorizedForFutureCommand", governance.latest3CorinthiansSourceShapeMigrationPolicy?.sourceShapeMigrationAuthorizedForFutureCommand);
requireFalse("governance.latest3CorinthiansSourceShapeMigrationPolicy.candidateTextMutation", governance.latest3CorinthiansSourceShapeMigrationPolicy?.candidateTextMutation);
requireFalse("governance.latest3CorinthiansSourceShapeMigrationPolicy.trustPromotion", governance.latest3CorinthiansSourceShapeMigrationPolicy?.trustPromotion);
requireFalse("governance.latest3CorinthiansSourceShapeMigrationPolicy.appRenderPromotion", governance.latest3CorinthiansSourceShapeMigrationPolicy?.appRenderPromotion);

requireIncludes("allowedClaims", governance.allowedClaims, "broader_canon_3corinthians_source_shape_migration_policy_recorded");
requireIncludes("allowedClaims", governance.allowedClaims, "broader_canon_3corinthians_rebuild_required_before_candidate_repair");
requireIncludes("blockedClaims", governance.blockedClaims, "broader_canon_3corinthians_text_repaired_by_migration_policy");
requireIncludes("blockedClaims", governance.blockedClaims, "broader_canon_3corinthians_trusted_by_migration_policy");

requireEqual("classification.threeCorinthiansSourceShapeMigrationPolicy.recordPath", classification.threeCorinthiansSourceShapeMigrationPolicy?.recordPath, policyPath);
requireFalse("classification.threeCorinthiansSourceShapeMigrationPolicy.textMutation", classification.threeCorinthiansSourceShapeMigrationPolicy?.textMutation);
requireFalse("classification.threeCorinthiansSourceShapeMigrationPolicy.trustPromotion", classification.threeCorinthiansSourceShapeMigrationPolicy?.trustPromotion);
requireFalse("classification.threeCorinthiansSourceShapeMigrationPolicy.appRenderPromotion", classification.threeCorinthiansSourceShapeMigrationPolicy?.appRenderPromotion);

requireEqual("blocker.latestSourceShapeMigrationPolicy.recordPath", blocker.latestSourceShapeMigrationPolicy?.recordPath, policyPath);
requireTrue("blocker.latestSourceShapeMigrationPolicy.sourceShapeMigrationAuthorizedForFutureCommand", blocker.latestSourceShapeMigrationPolicy?.sourceShapeMigrationAuthorizedForFutureCommand);
requireFalse("blocker.latestSourceShapeMigrationPolicy.candidateTextMutation", blocker.latestSourceShapeMigrationPolicy?.candidateTextMutation);
requireFalse("blocker.latestSourceShapeMigrationPolicy.trustPromotion", blocker.latestSourceShapeMigrationPolicy?.trustPromotion);
requireFalse("blocker.latestSourceShapeMigrationPolicy.appRenderPromotion", blocker.latestSourceShapeMigrationPolicy?.appRenderPromotion);

console.log(JSON.stringify({
  audit: "broader-canon-3corinthians-source-shape-migration-policy",
  status: failures.length ? "failed" : "passed",
  policyPath,
  candidatePath,
  candidateSha256: currentCandidateSha,
  candidateTextMutation: false,
  trustPromotion: false,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair 3 Corinthians source-shape migration policy.");
  process.exit(1);
}

console.log("ALL PASSED");
console.log("NEXT: 3 Corinthians source-shape migration policy passed QC.");
