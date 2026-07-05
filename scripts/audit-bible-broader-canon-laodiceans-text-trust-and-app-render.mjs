import fs from "node:fs";
import crypto from "node:crypto";

const failures = [];

const candidatePath = "data/bible/NT/epistleofthelaodiceans.json";
const finalPath = "data/bible/registry/broader-canon-laodiceans-text-trust-and-app-render-2026-07-04.json";
const governancePath = "data/bible/registry/broader-canon-governance.json";
const classificationPath = "data/bible/registry/broader-canon-source-visible-classification-2026-07-04.json";

function read(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function fail(type, detail) {
  failures.push({ type, ...detail });
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

function collectRows(value) {
  const rows = [];

  function visit(node, jsonPath = "$") {
    if (Array.isArray(node)) {
      node.forEach((child, index) => visit(child, `${jsonPath}[${index}]`));
      return;
    }

    if (!node || typeof node !== "object") return;

    if (typeof node.text === "string") rows.push({ path: jsonPath, text: node.text });

    for (const [key, child] of Object.entries(node)) visit(child, `${jsonPath}.${key}`);
  }

  visit(value);
  return rows;
}

const candidate = read(candidatePath);
const finalRecord = read(finalPath);
const governance = read(governancePath);
const classification = read(classificationPath);
const rows = collectRows(candidate);

eq("candidate status", candidate.status, "app_render_eligible_textually_trusted_gutenberg_witness_backed");
eq("row count", rows.length, 18);
eq("final status", finalRecord.status, "app_render_eligible_textually_trusted_gutenberg_witness_backed");

truthy("candidate text trusted", finalRecord.trustBoundary?.candidateTextTrusted);
truthy("textTrustPromotion", finalRecord.trustBoundary?.textTrustPromotion);
truthy("appRenderPromotion", finalRecord.trustBoundary?.appRenderPromotion);
falsey("globalBroaderCanonTrustPromotion", finalRecord.trustBoundary?.globalBroaderCanonTrustPromotion);
falsey("otherBroaderCanonCandidatePromotion", finalRecord.trustBoundary?.otherBroaderCanonCandidatePromotion);
eq("text sha unchanged", finalRecord.trustBoundary?.candidateTextSha256BeforeStatusUpdate, finalRecord.trustBoundary?.candidateTextSha256AfterStatusUpdate);

eq("governance latest", governance.latestLaodiceansTextTrustAndAppRender?.recordPath, finalPath);
truthy("governance text trust", governance.latestLaodiceansTextTrustAndAppRender?.textTrustPromotion);
truthy("governance app render", governance.latestLaodiceansTextTrustAndAppRender?.appRenderPromotion);
falsey("governance global", governance.latestLaodiceansTextTrustAndAppRender?.globalBroaderCanonTrustPromotion);
falsey("governance text mutation", governance.latestLaodiceansTextTrustAndAppRender?.bibleTextMutation);

includes("allowedClaims", governance.allowedClaims, "broader_canon_laodiceans_textually_trusted_gutenberg_witness_backed");
includes("allowedClaims", governance.allowedClaims, "broader_canon_laodiceans_app_render_eligible_gutenberg_witness_backed");
includes("blockedClaims", governance.blockedClaims, "broader_canon_global_app_render_eligible_from_laodiceans");
includes("blockedClaims", governance.blockedClaims, "broader_canon_laodiceans_synthetic_verse_7_created_during_finalization");

eq("classification latest", classification.laodiceansTextTrustAndAppRender?.recordPath, finalPath);
truthy("classification text trust", classification.laodiceansTextTrustAndAppRender?.textTrust);
truthy("classification app render", classification.laodiceansTextTrustAndAppRender?.appRenderPromotion);
falsey("classification text mutation", classification.laodiceansTextTrustAndAppRender?.bibleTextMutation);

console.log(JSON.stringify({
  audit: "broader-canon-laodiceans-text-trust-and-app-render",
  status: failures.length ? "failed" : "passed",
  finalPath,
  candidatePath,
  candidateRows: rows.length,
  bibleTextMutation: false,
  textTrust: true,
  appRenderEligible: true,
  globalBroaderCanonTrustPromotion: false,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair Laodiceans text-trust/app-render finalization.");
  process.exit(1);
}

console.log("ALL PASSED");
console.log("NEXT: Laodiceans finalization passed QC.");
