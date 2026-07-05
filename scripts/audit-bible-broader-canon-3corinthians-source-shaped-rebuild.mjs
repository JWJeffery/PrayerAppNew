import fs from "node:fs";
import crypto from "node:crypto";

const failures = [];

const candidatePath = "data/bible/AR/3corinthiansAR.json";
const sourceMapPath = "data/bible/registry/broader-canon-3corinthians-mr-james-source-map-2026-07-04.json";
const supersededPath = "data/bible/translations/mr-james-apocryphal-nt-1924/raw/third-corinthians-superseded-19-row-candidate.json";
const rebuildPath = "data/bible/registry/broader-canon-3corinthians-source-shaped-rebuild-2026-07-04.json";
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

function falsey(label, actual) {
  if (actual !== false) fail("not-false", { label, actual });
}

function truthy(label, actual) {
  if (actual !== true) fail("not-true", { label, actual });
}

function includes(label, list, value) {
  if (!Array.isArray(list) || !list.includes(value)) fail("missing-list-value", { label, value });
}

const candidate = read(candidatePath);
const sourceMap = read(sourceMapPath);
const superseded = read(supersededPath);
const rebuild = read(rebuildPath);
const governance = read(governancePath);
const classification = read(classificationPath);
const blocker = read(blockerPath);
const candidateSha = sha256File(candidatePath);

const sourceRows = sourceMap.sourceMap.filter(row => row.sourceUnitType === "numbered_source_row");
const sourceIntro = sourceMap.sourceMap.find(row => row.sourceUnitType === "introductory_narrative");

const candidateRows = [];
for (const chapter of candidate.chapters || []) {
  for (const verse of chapter.verses || []) {
    candidateRows.push({ chapter, verse });
  }
}

eq("candidate status", candidate.status, "source_shaped_rebuilt_from_corrected_mr_james_source_map_pending_trust_certification");
eq("candidate row count", candidateRows.length, 33);
eq("source row count", sourceRows.length, 33);
eq("chapter count", (candidate.chapters || []).length, 3);
eq("section I count", candidate.chapters?.[0]?.verses?.length, 7);
eq("section II count", candidate.chapters?.[1]?.verses?.length, 3);
eq("section III count", candidate.chapters?.[2]?.verses?.length, 23);

if (!candidate.introductoryNarrative || candidate.introductoryNarrative.text !== sourceIntro?.sourceText) {
  fail("intro-narrative-mismatch", {});
}

for (const sourceRow of sourceRows) {
  const match = candidateRows.find(row => row.verse.sourceUnitId === sourceRow.sourceUnitId);
  if (!match) {
    fail("missing-source-row-in-candidate", { sourceUnitId: sourceRow.sourceUnitId });
    continue;
  }

  eq(`text ${sourceRow.sourceUnitId}`, match.verse.text, sourceRow.sourceText);
  eq(`visibleMarker ${sourceRow.sourceUnitId}`, match.verse.visibleMarker, sourceRow.visibleMarker);
  eq(`visiblePolicy ${sourceRow.sourceUnitId}`, match.verse.visibleMarkerPolicy, sourceRow.visibleMarkerPolicy);
}

const anomalyRows = candidateRows.filter(row => row.verse.visibleNumber === 86);
eq("visible 86 anomaly row count", anomalyRows.length, 1);
eq("visible 86 anomaly policy", anomalyRows[0]?.verse?.visibleMarkerPolicy, "preserved_visible_source_anomaly_not_silently_corrected");

eq("superseded status", superseded.status, "superseded_by_source_shaped_mr_james_rebuild");
eq("superseded row count", superseded.rowCount, 19);
eq("rebuild status", rebuild.status, "candidate_rebuilt_from_corrected_mr_james_source_map_pending_trust_certification");
eq("rebuild rows before", rebuild.rebuildSummary?.previousCandidateRows, 19);
eq("rebuild rows after", rebuild.rebuildSummary?.rebuiltCandidateRows, 33);
truthy("rebuild candidate mutation", rebuild.trustBoundary?.candidateBibleTextMutated);
falsey("rebuild candidate trusted", rebuild.trustBoundary?.candidateTextTrusted);
falsey("rebuild trust promotion", rebuild.trustBoundary?.trustPromotion);
falsey("rebuild app render promotion", rebuild.trustBoundary?.appRenderPromotion);
eq("rebuild after sha", rebuild.trustBoundary?.candidateSha256After, candidateSha);

eq("governance latest rebuild", governance.latest3CorinthiansSourceShapedRebuild?.recordPath, rebuildPath);
truthy("governance mutation", governance.latest3CorinthiansSourceShapedRebuild?.candidateTextMutation);
falsey("governance trust", governance.latest3CorinthiansSourceShapedRebuild?.trustPromotion);
falsey("governance render", governance.latest3CorinthiansSourceShapedRebuild?.appRenderPromotion);
includes("allowedClaims", governance.allowedClaims, "broader_canon_3corinthians_candidate_rebuilt_from_corrected_mr_james_source_map");
includes("allowedClaims", governance.allowedClaims, "broader_canon_3corinthians_candidate_rows_now_33");
includes("blockedClaims", governance.blockedClaims, "broader_canon_3corinthians_textually_trusted_by_rebuild_alone");
includes("blockedClaims", governance.blockedClaims, "broader_canon_3corinthians_app_render_eligible_by_rebuild_alone");

eq("classification rebuild", classification.threeCorinthiansSourceShapedRebuild?.recordPath, rebuildPath);
truthy("classification mutation", classification.threeCorinthiansSourceShapedRebuild?.textMutation);
falsey("classification trust", classification.threeCorinthiansSourceShapedRebuild?.trustPromotion);
falsey("classification render", classification.threeCorinthiansSourceShapedRebuild?.appRenderPromotion);

eq("blocker rebuild", blocker.latestSourceShapedRebuild?.recordPath, rebuildPath);
truthy("blocker mutation", blocker.latestSourceShapedRebuild?.candidateTextMutation);
falsey("blocker trust", blocker.latestSourceShapedRebuild?.trustPromotion);
falsey("blocker render", blocker.latestSourceShapedRebuild?.appRenderPromotion);

console.log(JSON.stringify({
  audit: "broader-canon-3corinthians-source-shaped-rebuild",
  status: failures.length ? "failed" : "passed",
  candidatePath,
  sourceMapPath,
  rebuildPath,
  candidateSha256: candidateSha,
  candidateTextMutation: true,
  trustPromotion: false,
  appRenderPromotion: false,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair 3 Corinthians source-shaped rebuild.");
  process.exit(1);
}

console.log("ALL PASSED");
console.log("NEXT: 3 Corinthians source-shaped rebuild passed QC. Next step is separate trust certification.");
