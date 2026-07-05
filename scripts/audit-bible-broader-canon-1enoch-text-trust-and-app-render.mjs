import fs from "node:fs";

const failures = [];

const candidatePath = "data/bible/OT/1enoch.json";
const finalPath = "data/bible/registry/broader-canon-1enoch-text-trust-and-app-render-2026-07-04.json";
const governancePath = "data/bible/registry/broader-canon-governance.json";
const classificationPath = "data/bible/registry/broader-canon-source-visible-classification-2026-07-04.json";

function read(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function fail(type, detail) {
  failures.push(Object.assign({ type: type }, detail));
}

function eq(label, actual, expected) {
  if (actual !== expected) fail("mismatch", { label: label, actual: actual, expected: expected });
}

function truthy(label, actual) {
  if (actual !== true) fail("not-true", { label: label, actual: actual });
}

function falsey(label, actual) {
  if (actual !== false) fail("not-false", { label: label, actual: actual });
}

function includes(label, list, value) {
  if (!Array.isArray(list) || !list.includes(value)) fail("missing-list-value", { label: label, value: value });
}

function collectRows(value) {
  const rows = [];

  function visit(node) {
    if (Array.isArray(node)) {
      node.forEach(function(child) {
        visit(child);
      });
      return;
    }

    if (!node || typeof node !== "object") return;

    if (typeof node.text === "string") {
      rows.push(node.text);
    } else if (node.text && typeof node.text === "object") {
      Object.keys(node.text).forEach(function(lane) {
        if (typeof node.text[lane] === "string") rows.push(node.text[lane]);
      });
    }

    Object.keys(node).forEach(function(key) {
      visit(node[key]);
    });
  }

  visit(value);
  return rows;
}

const candidate = read(candidatePath);
const finalRecord = read(finalPath);
const governance = read(governancePath);
const classification = read(classificationPath);
const rows = collectRows(candidate);

eq("candidate status", candidate.status, "app_render_eligible_textually_trusted_fixed_entity_source_binding_backed");
eq("final status", finalRecord.status, "app_render_eligible_textually_trusted_fixed_entity_source_binding_backed");
eq("row count", rows.length, 1048);
eq("final row count", finalRecord.certificationBasis?.candidateRows, 1048);

truthy("candidate text trusted", finalRecord.trustBoundary?.candidateTextTrusted);
truthy("textTrustPromotion", finalRecord.trustBoundary?.textTrustPromotion);
truthy("appRenderPromotion", finalRecord.trustBoundary?.appRenderPromotion);
falsey("globalBroaderCanonTrustPromotion", finalRecord.trustBoundary?.globalBroaderCanonTrustPromotion);
falsey("otherBroaderCanonCandidatePromotion", finalRecord.trustBoundary?.otherBroaderCanonCandidatePromotion);
eq("text sha unchanged", finalRecord.trustBoundary?.candidateTextSha256BeforeStatusUpdate, finalRecord.trustBoundary?.candidateTextSha256AfterStatusUpdate);

eq("governance latest", governance.latest1EnochTextTrustAndAppRender?.recordPath, finalPath);
truthy("governance text trust", governance.latest1EnochTextTrustAndAppRender?.textTrustPromotion);
truthy("governance app render", governance.latest1EnochTextTrustAndAppRender?.appRenderPromotion);
falsey("governance global", governance.latest1EnochTextTrustAndAppRender?.globalBroaderCanonTrustPromotion);
falsey("governance text mutation", governance.latest1EnochTextTrustAndAppRender?.bibleTextMutation);

includes("allowedClaims", governance.allowedClaims, "broader_canon_1enoch_textually_trusted_fixed_entity_source_binding_backed");
includes("allowedClaims", governance.allowedClaims, "broader_canon_1enoch_app_render_eligible_fixed_entity_source_binding_backed");
includes("blockedClaims", governance.blockedClaims, "broader_canon_global_app_render_eligible_from_1enoch");
includes("blockedClaims", governance.blockedClaims, "broader_canon_1enoch_exact_sacred_texts_page_reproduction_claim_promoted");

eq("classification latest", classification.oneEnochTextTrustAndAppRender?.recordPath, finalPath);
truthy("classification text trust", classification.oneEnochTextTrustAndAppRender?.textTrust);
truthy("classification app render", classification.oneEnochTextTrustAndAppRender?.appRenderPromotion);
falsey("classification text mutation", classification.oneEnochTextTrustAndAppRender?.bibleTextMutation);

console.log(JSON.stringify({
  audit: "broader-canon-1enoch-text-trust-and-app-render",
  status: failures.length ? "failed" : "passed",
  finalPath: finalPath,
  candidatePath: candidatePath,
  candidateRows: rows.length,
  bibleTextMutation: false,
  textTrust: true,
  appRenderEligible: true,
  globalBroaderCanonTrustPromotion: false,
  failures: failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair 1 Enoch text-trust/app-render finalization.");
  process.exit(1);
}

console.log("ALL PASSED");
console.log("NEXT: 1 Enoch finalization passed QC.");
