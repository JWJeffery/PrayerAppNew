#!/usr/bin/env node
import fs from "node:fs";

const candidatePath = "data/bible/ET/bookofjubileesET.json";
const finalPath = "data/bible/registry/broader-canon-jubilees-text-trust-and-app-render-2026-07-04.json";
const collationPath = "data/bible/registry/broader-canon-source-binding-collation-jubilees-2026-07-04.json";
const governancePath = "data/bible/registry/broader-canon-governance.json";
const classificationPath = "data/bible/registry/broader-canon-source-visible-classification-2026-07-04.json";
const finalStatus = "app_render_eligible_textually_trusted_source_page_binding_backed";

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
const finalRecord = read(finalPath);
const collation = read(collationPath);
const governance = read(governancePath);
const classification = read(classificationPath);
const candidateRows = rows(candidate);

eq("candidate status", candidate.status, finalStatus);
eq("final status", finalRecord.status, finalStatus);
eq("row count", candidateRows.length, 975);
eq("final candidateRows", finalRecord.certificationBasis?.candidateRows, 975);
eq("collation status", collation.status, "passed_source_page_binding_collation_no_candidate_mutation");
eq("collation binding count", collation.validation?.bindingCount, 975);
eq("collation failure count", collation.validation?.failureCount, 0);

truthy("candidate text trusted", finalRecord.trustBoundary?.candidateTextTrusted);
truthy("textTrustPromotion", finalRecord.trustBoundary?.textTrustPromotion);
truthy("appRenderPromotion", finalRecord.trustBoundary?.appRenderPromotion);
falsey("globalBroaderCanonTrustPromotion", finalRecord.trustBoundary?.globalBroaderCanonTrustPromotion);
falsey("otherBroaderCanonCandidatePromotion", finalRecord.trustBoundary?.otherBroaderCanonCandidatePromotion);
falsey("bible text mutation", finalRecord.certificationBasis?.bibleTextMutatedInThisStep);
eq("text sha unchanged", finalRecord.trustBoundary?.candidateTextSha256BeforeStatusUpdate, finalRecord.trustBoundary?.candidateTextSha256AfterStatusUpdate);

eq("governance latest", governance.latestJubileesTextTrustAndAppRender?.recordPath, finalPath);
truthy("governance text trust", governance.latestJubileesTextTrustAndAppRender?.textTrustPromotion);
truthy("governance app render", governance.latestJubileesTextTrustAndAppRender?.appRenderPromotion);
falsey("governance global", governance.latestJubileesTextTrustAndAppRender?.globalBroaderCanonTrustPromotion);
falsey("governance bible mutation", governance.latestJubileesTextTrustAndAppRender?.bibleTextMutation);

includes("allowedClaims", governance.allowedClaims, "broader_canon_jubilees_textually_trusted_source_page_binding_backed");
includes("allowedClaims", governance.allowedClaims, "broader_canon_jubilees_app_render_eligible_source_page_binding_backed");
includes("allowedClaims", governance.allowedClaims, "broader_canon_jubilees_completed_certified_and_render_eligible");
includes("blockedClaims", governance.blockedClaims, "broader_canon_global_app_render_eligible_from_jubilees");
includes("blockedClaims", governance.blockedClaims, "broader_canon_other_candidates_promoted_by_jubilees_app_render");
includes("blockedClaims", governance.blockedClaims, "broader_canon_jubilees_exact_sacred_texts_page_reproduction_claim_promoted");
includes("blockedClaims", governance.blockedClaims, "broader_canon_jubilees_source_verse_number_rebuild_claim_promoted");

eq("classification latest", classification.jubileesTextTrustAndAppRender?.recordPath, finalPath);
truthy("classification text trust", classification.jubileesTextTrustAndAppRender?.textTrust);
truthy("classification app render", classification.jubileesTextTrustAndAppRender?.appRenderPromotion);
falsey("classification bible mutation", classification.jubileesTextTrustAndAppRender?.bibleTextMutation);
falsey("classification global", classification.jubileesTextTrustAndAppRender?.globalBroaderCanonTrustPromotion);

console.log(JSON.stringify({
  audit: "broader-canon-jubilees-text-trust-and-app-render",
  status: failures.length ? "failed" : "passed",
  finalPath,
  candidatePath,
  candidateRows: candidateRows.length,
  bibleTextMutation: false,
  textTrust: true,
  appRenderEligible: true,
  globalBroaderCanonTrustPromotion: false,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair Jubilees text-trust/app-render finalization.");
  process.exit(1);
}

console.log("ALL PASSED");
console.log("NEXT: Jubilees finalization passed QC.");
