import fs from "node:fs";
import crypto from "node:crypto";

const failures = [];

const candidatePath = "data/bible/AR/3corinthiansAR.json";
const sourceMapPath = "data/bible/registry/broader-canon-3corinthians-mr-james-source-map-2026-07-04.json";
const certPath = "data/bible/registry/broader-canon-3corinthians-text-trust-certification-2026-07-04.json";
const appRenderPath = "data/bible/registry/broader-canon-3corinthians-app-render-eligibility-2026-07-04.json";
const governancePath = "data/bible/registry/broader-canon-governance.json";
const classificationPath = "data/bible/registry/broader-canon-source-visible-classification-2026-07-04.json";
const blockerPath = "data/bible/registry/broader-canon-source-identity-blocker-3corinthians-2026-07-04.json";

function read(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function sha256File(path) {
  return crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex");
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

const candidate = read(candidatePath);
const sourceMap = read(sourceMapPath);
const cert = read(certPath);
const appRender = read(appRenderPath);
const governance = read(governancePath);
const classification = read(classificationPath);
const blocker = read(blockerPath);
const candidateSha = sha256File(candidatePath);

const sourceRows = sourceMap.sourceMap.filter(row => row.sourceUnitType === "numbered_source_row");
const candidateRows = (candidate.chapters || []).flatMap(chapter => chapter.verses || []);

eq("candidate status", candidate.status, "app_render_eligible_textually_trusted_source_map_backed");
eq("candidate rows", candidateRows.length, 33);
eq("source rows", sourceRows.length, 33);

for (const sourceRow of sourceRows) {
  const candidateRow = candidateRows.find(row => row.sourceUnitId === sourceRow.sourceUnitId);
  if (!candidateRow) {
    fail("missing-source-row", { sourceUnitId: sourceRow.sourceUnitId });
  } else {
    eq(`row text ${sourceRow.sourceUnitId}`, candidateRow.text, sourceRow.sourceText);
    eq(`row sha ${sourceRow.sourceUnitId}`, candidateRow.sourceTextSha256, sourceRow.sourceTextSha256);
  }
}

const anomalyRows = candidateRows.filter(row => row.visibleNumber === 86);
eq("86 anomaly rows", anomalyRows.length, 1);
eq("86 anomaly policy", anomalyRows[0]?.visibleMarkerPolicy, "preserved_visible_source_anomaly_not_silently_corrected");

eq("app render status", appRender.status, "app_render_eligible_textually_trusted_source_map_backed");
truthy("app render promotion", appRender.trustBoundary?.appRenderPromotion);
truthy("candidate text trusted", appRender.trustBoundary?.candidateTextTrusted);
falsey("global broader canon trust promotion", appRender.trustBoundary?.globalBroaderCanonTrustPromotion);
falsey("other candidate promotion", appRender.trustBoundary?.otherBroaderCanonCandidatePromotion);
eq("app render sha after", appRender.trustBoundary?.candidateSha256AfterStatusUpdate, candidateSha);

truthy("cert latest render", cert.latestAppRenderEligibility?.appRenderPromotion);
falsey("cert latest global", cert.latestAppRenderEligibility?.globalBroaderCanonTrustPromotion);

eq("governance latest app render", governance.latest3CorinthiansAppRenderEligibility?.recordPath, appRenderPath);
truthy("governance app render", governance.latest3CorinthiansAppRenderEligibility?.appRenderPromotion);
falsey("governance global", governance.latest3CorinthiansAppRenderEligibility?.globalBroaderCanonTrustPromotion);
falsey("governance other candidate", governance.latest3CorinthiansAppRenderEligibility?.otherBroaderCanonCandidatePromotion);

includes("allowedClaims", governance.allowedClaims, "broader_canon_3corinthians_app_render_eligible_source_map_backed");
includes("allowedClaims", governance.allowedClaims, "broader_canon_3corinthians_completed_repaired_certified_and_render_eligible");
includes("blockedClaims", governance.blockedClaims, "broader_canon_global_app_render_eligible_from_3corinthians");
includes("blockedClaims", governance.blockedClaims, "broader_canon_other_candidates_promoted_by_3corinthians_app_render");

eq("classification app render", classification.threeCorinthiansAppRenderEligibility?.recordPath, appRenderPath);
truthy("classification app render", classification.threeCorinthiansAppRenderEligibility?.appRenderPromotion);
falsey("classification global", classification.threeCorinthiansAppRenderEligibility?.globalBroaderCanonTrustPromotion);
falsey("classification other candidate", classification.threeCorinthiansAppRenderEligibility?.otherBroaderCanonCandidatePromotion);

eq("blocker app render", blocker.latestAppRenderEligibility?.recordPath, appRenderPath);
truthy("blocker app render resolved", blocker.latestAppRenderEligibility?.blockerResolvedForAppRender);
falsey("blocker global", blocker.latestAppRenderEligibility?.globalBroaderCanonTrustPromotion);
falsey("blocker other candidate", blocker.latestAppRenderEligibility?.otherBroaderCanonCandidatePromotion);

console.log(JSON.stringify({
  audit: "broader-canon-3corinthians-app-render-eligibility",
  status: failures.length ? "failed" : "passed",
  appRenderPath,
  candidateSha256: candidateSha,
  appRenderEligible: true,
  globalBroaderCanonTrustPromotion: false,
  otherBroaderCanonCandidatePromotion: false,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair 3 Corinthians app-render eligibility.");
  process.exit(1);
}

console.log("ALL PASSED");
console.log("NEXT: 3 Corinthians app-render eligibility passed QC.");
