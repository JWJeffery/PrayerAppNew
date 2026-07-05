import fs from "node:fs";
import crypto from "node:crypto";

const failures = [];

const candidatePath = "data/bible/AR/3corinthiansAR.json";
const sourceMapPath = "data/bible/registry/broader-canon-3corinthians-mr-james-source-map-2026-07-04.json";
const rebuildPath = "data/bible/registry/broader-canon-3corinthians-source-shaped-rebuild-2026-07-04.json";
const certPath = "data/bible/registry/broader-canon-3corinthians-text-trust-certification-2026-07-04.json";
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
const rebuild = read(rebuildPath);
const cert = read(certPath);
const governance = read(governancePath);
const classification = read(classificationPath);
const blocker = read(blockerPath);
const candidateSha = sha256File(candidatePath);

const sourceRows = sourceMap.sourceMap.filter(row => row.sourceUnitType === "numbered_source_row");
const candidateRows = (candidate.chapters || []).flatMap(chapter => chapter.verses || []);

eq("candidate status", candidate.status, "textually_trusted_source_map_backed_pending_app_render_policy");
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

eq("cert status", cert.status, "certified_textually_trusted_source_map_backed_pending_app_render_policy");
truthy("cert text trust", cert.trustBoundary?.candidateTextCertifiedTrusted);
truthy("cert trust promotion", cert.trustBoundary?.trustPromotion);
falsey("cert app render", cert.trustBoundary?.appRenderPromotion);
falsey("cert global broader canon", cert.trustBoundary?.globalBroaderCanonTrustPromotion);
eq("cert rebuilt text sha", cert.trustBoundary?.rebuiltTextSha256, rebuild.trustBoundary?.candidateSha256After);
eq("cert certified candidate sha", cert.trustBoundary?.certifiedCandidateSha256, candidateSha);

eq("rebuild latest cert", rebuild.latestTextTrustCertification?.recordPath, certPath);
truthy("rebuild latest trust", rebuild.latestTextTrustCertification?.trustPromotion);
falsey("rebuild latest render", rebuild.latestTextTrustCertification?.appRenderPromotion);

eq("governance latest cert", governance.latest3CorinthiansTextTrustCertification?.recordPath, certPath);
truthy("governance trust", governance.latest3CorinthiansTextTrustCertification?.trustPromotion);
falsey("governance app render", governance.latest3CorinthiansTextTrustCertification?.appRenderPromotion);
falsey("governance global", governance.latest3CorinthiansTextTrustCertification?.globalBroaderCanonTrustPromotion);

includes("allowedClaims", governance.allowedClaims, "broader_canon_3corinthians_textually_trusted_source_map_backed");
includes("allowedClaims", governance.allowedClaims, "broader_canon_3corinthians_trust_certified_corrected_33_row_mr_james_source_map");
includes("blockedClaims", governance.blockedClaims, "broader_canon_3corinthians_app_render_eligible_without_app_render_policy");
includes("blockedClaims", governance.blockedClaims, "broader_canon_global_textually_trusted_from_3corinthians_certification");

eq("classification cert", classification.threeCorinthiansTextTrustCertification?.recordPath, certPath);
truthy("classification text trust", classification.threeCorinthiansTextTrustCertification?.textTrust);
truthy("classification trust", classification.threeCorinthiansTextTrustCertification?.trustPromotion);
falsey("classification render", classification.threeCorinthiansTextTrustCertification?.appRenderPromotion);

eq("blocker cert", blocker.latestTextTrustCertification?.recordPath, certPath);
truthy("blocker resolved", blocker.latestTextTrustCertification?.blockerResolvedForTextTrust);
truthy("blocker trust", blocker.latestTextTrustCertification?.trustPromotion);
falsey("blocker render", blocker.latestTextTrustCertification?.appRenderPromotion);

console.log(JSON.stringify({
  audit: "broader-canon-3corinthians-text-trust-certification",
  status: failures.length ? "failed" : "passed",
  certPath,
  candidateSha256: candidateSha,
  textTrust: true,
  appRenderPromotion: false,
  globalBroaderCanonTrustPromotion: false,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair 3 Corinthians text-trust certification.");
  process.exit(1);
}

console.log("ALL PASSED");
console.log("NEXT: 3 Corinthians text-trust certification passed QC.");
