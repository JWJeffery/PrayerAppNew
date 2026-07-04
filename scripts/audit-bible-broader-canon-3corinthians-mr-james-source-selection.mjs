import fs from "node:fs";

const failures = [];

const rawPath = "data/bible/translations/mr-james-apocryphal-nt-1924/raw/third-corinthians-wikisource-source-body.json";
const recordPath = "data/bible/registry/broader-canon-3corinthians-mr-james-source-selection-2026-07-04.json";
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

const raw = read(rawPath);
const record = read(recordPath);
const governance = read(governancePath);
const classification = read(classificationPath);
const blocker = read(blockerPath);

requireEqual("raw.status", raw.status, "source_body_captured_for_governed_collation_target");
requireEqual("raw.source.translator", raw.source?.translator, "Montague Rhodes James");
requireEqual("raw.trustBoundary.candidateBibleTextMutated", raw.trustBoundary?.candidateBibleTextMutated, false);
requireEqual("raw.trustBoundary.candidateTextTrusted", raw.trustBoundary?.candidateTextTrusted, false);
requireEqual("record.status", record.status, "source_selection_target_recorded_pending_exact_row_mapping_and_candidate_repair");
requireEqual("record.rawSourcePath", record.rawSourcePath, rawPath);
requireEqual("record.diagnosticSummary.candidateRowsDetected", record.diagnosticSummary?.candidateRowsDetected, 19);
requireEqual("record.diagnosticSummary.exactNormalizedSubstringRows", record.diagnosticSummary?.exactNormalizedSubstringRows, 0);
requireEqual("record.governanceDecision.candidateAppearsRelatedToSourceLead", record.governanceDecision?.candidateAppearsRelatedToSourceLead, true);
requireEqual("record.governanceDecision.candidateIsSourceExact", record.governanceDecision?.candidateIsSourceExact, false);
requireFalse("record.governanceDecision.candidateTextMutation", record.governanceDecision?.candidateTextMutation);
requireFalse("record.governanceDecision.trustPromotion", record.governanceDecision?.trustPromotion);
requireFalse("record.governanceDecision.appRenderPromotion", record.governanceDecision?.appRenderPromotion);

requireEqual("governance.latest3CorinthiansMrJamesSourceSelection.recordPath", governance.latest3CorinthiansMrJamesSourceSelection?.recordPath, recordPath);
requireFalse("governance.latest3CorinthiansMrJamesSourceSelection.candidateTextMutation", governance.latest3CorinthiansMrJamesSourceSelection?.candidateTextMutation);
requireFalse("governance.latest3CorinthiansMrJamesSourceSelection.trustPromotion", governance.latest3CorinthiansMrJamesSourceSelection?.trustPromotion);
requireFalse("governance.latest3CorinthiansMrJamesSourceSelection.appRenderPromotion", governance.latest3CorinthiansMrJamesSourceSelection?.appRenderPromotion);

requireIncludes("allowedClaims", governance.allowedClaims, "broader_canon_3corinthians_mr_james_source_selection_target_recorded");
requireIncludes("allowedClaims", governance.allowedClaims, "broader_canon_3corinthians_candidate_related_to_mr_james_not_exact");
requireIncludes("blockedClaims", governance.blockedClaims, "broader_canon_3corinthians_trusted_from_overlap_diagnostic");
requireIncludes("blockedClaims", governance.blockedClaims, "broader_canon_3corinthians_current_candidate_exact_mr_james");

requireEqual("classification.threeCorinthiansMrJamesSourceSelection.recordPath", classification.threeCorinthiansMrJamesSourceSelection?.recordPath, recordPath);
requireFalse("classification.threeCorinthiansMrJamesSourceSelection.textMutation", classification.threeCorinthiansMrJamesSourceSelection?.textMutation);
requireFalse("classification.threeCorinthiansMrJamesSourceSelection.trustPromotion", classification.threeCorinthiansMrJamesSourceSelection?.trustPromotion);
requireFalse("classification.threeCorinthiansMrJamesSourceSelection.appRenderPromotion", classification.threeCorinthiansMrJamesSourceSelection?.appRenderPromotion);

requireEqual("blocker.latestMrJamesSourceSelection.recordPath", blocker.latestMrJamesSourceSelection?.recordPath, recordPath);
requireEqual("blocker.latestMrJamesSourceSelection.candidateIsSourceExact", blocker.latestMrJamesSourceSelection?.candidateIsSourceExact, false);
requireFalse("blocker.latestMrJamesSourceSelection.candidateTextMutation", blocker.latestMrJamesSourceSelection?.candidateTextMutation);
requireFalse("blocker.latestMrJamesSourceSelection.trustPromotion", blocker.latestMrJamesSourceSelection?.trustPromotion);

console.log(JSON.stringify({
  audit: "broader-canon-3corinthians-mr-james-source-selection",
  status: failures.length ? "failed" : "passed",
  rawPath,
  recordPath,
  candidateTextMutation: false,
  trustPromotion: false,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair 3 Corinthians M. R. James source-selection record.");
  process.exit(1);
}

console.log("ALL PASSED");
console.log("NEXT: 3 Corinthians M. R. James source-selection record passed QC.");
