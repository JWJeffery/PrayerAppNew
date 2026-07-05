#!/usr/bin/env node
import fs from "node:fs";

const candidatePath = "data/bible/ODES/odesofsolomonSY.json";
const blockerPath = "data/bible/registry/broader-canon-source-scope-blocker-odesofsolomon-2026-07-04.json";
const finalPath = "data/bible/registry/broader-canon-odesofsolomon-fragmentary-exclusion-2026-07-04.json";
const governancePath = "data/bible/registry/broader-canon-governance.json";
const classificationPath = "data/bible/registry/broader-canon-source-visible-classification-2026-07-04.json";
const finalStatus = "excluded_fragmentary_source_scope_not_app_render_eligible";

function read(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function rows(candidate) {
  return (candidate.chapters || []).flatMap(chapter => (chapter.verses || []).map(verse => ({
    ref: String(chapter.num) + ":" + String(verse.num),
    text: verse.text || ""
  })));
}

const failures = [];
function fail(type, detail) {
  failures.push(Object.assign({ type }, detail || {}));
}
function eq(label, actual, expected) {
  if (actual !== expected) fail("mismatch", { label, actual, expected });
}
function truthy(label, actual) {
  if (actual !== true) fail("not-true", { label, actual });
}
function falsey(label, actual) {
  if (actual !== false) fail("not-false", { label, actual });
}
function includes(label, list, value) {
  if (!Array.isArray(list) || !list.includes(value)) fail("missing-list-value", { label, value });
}

const candidate = read(candidatePath);
const blocker = read(blockerPath);
const finalRecord = read(finalPath);
const governance = read(governancePath);
const classification = read(classificationPath);
const candidateRows = rows(candidate);

eq("candidate status", candidate.status, finalStatus);
eq("final status", finalRecord.status, finalStatus);
eq("candidate row count", candidateRows.length, 3);
eq("final candidateRows", finalRecord.certificationBasis?.candidateRows, 3);
eq("blocker status", blocker.status, "blocked_candidate_fragmentary_source_scope_no_candidate_mutation");

truthy("fragmentary scope confirmed", finalRecord.certificationBasis?.fragmentaryScopeConfirmed);
truthy("candidate excluded from completion", finalRecord.trustBoundary?.candidateExcludedFromCompletion);
truthy("candidate excluded from app render", finalRecord.trustBoundary?.candidateExcludedFromAppRender);
truthy("future rebuild permitted", finalRecord.decision?.futureRebuildPermitted);
falsey("text trust promotion", finalRecord.certificationBasis?.textTrustPromotion);
falsey("app render promotion", finalRecord.certificationBasis?.appRenderPromotion);
falsey("global promotion", finalRecord.certificationBasis?.globalBroaderCanonTrustPromotion);
falsey("bible text mutation", finalRecord.certificationBasis?.bibleTextMutatedInThisStep);
eq("text sha unchanged", finalRecord.trustBoundary?.candidateTextSha256BeforeStatusUpdate, finalRecord.trustBoundary?.candidateTextSha256AfterStatusUpdate);

eq("governance latest", governance.latestOdesOfSolomonFragmentaryExclusion?.recordPath, finalPath);
falsey("governance text trust", governance.latestOdesOfSolomonFragmentaryExclusion?.textTrustPromotion);
falsey("governance app render", governance.latestOdesOfSolomonFragmentaryExclusion?.appRenderPromotion);
falsey("governance global", governance.latestOdesOfSolomonFragmentaryExclusion?.globalBroaderCanonTrustPromotion);
falsey("governance bible mutation", governance.latestOdesOfSolomonFragmentaryExclusion?.bibleTextMutation);
truthy("governance future rebuild", governance.latestOdesOfSolomonFragmentaryExclusion?.futureRebuildPermitted);

includes("allowedClaims", governance.allowedClaims, "broader_canon_odesofsolomon_fragmentary_exclusion_recorded");
includes("allowedClaims", governance.allowedClaims, "broader_canon_odesofsolomon_current_candidate_excluded_from_app_render");
includes("allowedClaims", governance.allowedClaims, "broader_canon_odesofsolomon_current_candidate_excluded_from_completion");
includes("blockedClaims", governance.blockedClaims, "broader_canon_odesofsolomon_fragmentary_candidate_treated_as_complete");
includes("blockedClaims", governance.blockedClaims, "broader_canon_odesofsolomon_fragmentary_candidate_app_render_eligible");
includes("blockedClaims", governance.blockedClaims, "broader_canon_odesofsolomon_rebuilt_without_complete_source_snapshot");

eq("classification latest", classification.odesOfSolomonFragmentaryExclusion?.recordPath, finalPath);
falsey("classification text trust", classification.odesOfSolomonFragmentaryExclusion?.textTrust);
falsey("classification app render", classification.odesOfSolomonFragmentaryExclusion?.appRenderPromotion);
falsey("classification bible mutation", classification.odesOfSolomonFragmentaryExclusion?.bibleTextMutation);
truthy("classification future rebuild", classification.odesOfSolomonFragmentaryExclusion?.futureRebuildPermitted);

console.log(JSON.stringify({
  audit: "broader-canon-odesofsolomon-fragmentary-exclusion",
  status: failures.length ? "failed" : "passed",
  finalPath,
  candidatePath,
  candidateRows: candidateRows.length,
  bibleTextMutation: false,
  textTrust: false,
  appRenderEligible: false,
  excludedFragmentaryCandidate: true,
  futureRebuildPermitted: true,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair Odes of Solomon fragmentary exclusion record.");
  process.exit(1);
}

console.log("ALL PASSED");
console.log("NEXT: Odes of Solomon fragmentary exclusion passed QC.");
