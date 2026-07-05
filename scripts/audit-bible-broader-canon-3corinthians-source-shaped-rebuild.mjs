import fs from "node:fs";
import crypto from "node:crypto";

const failures = [];

const candidatePath = "data/bible/AR/3corinthiansAR.json";
const sourceMapPath = "data/bible/registry/broader-canon-3corinthians-mr-james-source-map-2026-07-04.json";
const rebuildPath = "data/bible/registry/broader-canon-3corinthians-source-shaped-rebuild-2026-07-04.json";

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

const candidate = read(candidatePath);
const sourceMap = read(sourceMapPath);
const rebuild = read(rebuildPath);
const candidateSha = sha256File(candidatePath);

const sourceRows = sourceMap.sourceMap.filter(row => row.sourceUnitType === "numbered_source_row");
const candidateRows = (candidate.chapters || []).flatMap(chapter => chapter.verses || []);

if (!["source_shaped_rebuilt_from_corrected_mr_james_source_map_pending_trust_certification", "textually_trusted_source_map_backed_pending_app_render_policy"].includes(candidate.status)) {
  fail("bad-candidate-status", { actual: candidate.status });
}

eq("rebuild.status", rebuild.status, "candidate_rebuilt_from_corrected_mr_james_source_map_pending_trust_certification");
eq("candidate rows", candidateRows.length, 33);
eq("source rows", sourceRows.length, 33);
eq("chapter count", (candidate.chapters || []).length, 3);
eq("section I count", candidate.chapters?.[0]?.verses?.length, 7);
eq("section II count", candidate.chapters?.[1]?.verses?.length, 3);
eq("section III count", candidate.chapters?.[2]?.verses?.length, 23);
truthy("rebuild candidate mutation", rebuild.trustBoundary?.candidateBibleTextMutated);
falsey("rebuild app render promotion", rebuild.trustBoundary?.appRenderPromotion);
eq("current candidate sha", rebuild.trustBoundary?.candidateSha256After, candidate.sourceRebuild?.trustPromotion ? rebuild.trustBoundary?.candidateSha256After : candidateSha);

for (const sourceRow of sourceRows) {
  const candidateRow = candidateRows.find(row => row.sourceUnitId === sourceRow.sourceUnitId);
  if (!candidateRow) {
    fail("missing-source-row-in-candidate", { sourceUnitId: sourceRow.sourceUnitId });
  } else {
    eq(`row text ${sourceRow.sourceUnitId}`, candidateRow.text, sourceRow.sourceText);
    eq(`row sha ${sourceRow.sourceUnitId}`, candidateRow.sourceTextSha256, sourceRow.sourceTextSha256);
  }
}

const anomalyRows = candidateRows.filter(row => row.visibleNumber === 86);
eq("86 anomaly rows", anomalyRows.length, 1);
eq("86 anomaly policy", anomalyRows[0]?.visibleMarkerPolicy, "preserved_visible_source_anomaly_not_silently_corrected");

console.log(JSON.stringify({
  audit: "broader-canon-3corinthians-source-shaped-rebuild",
  status: failures.length ? "failed" : "passed",
  candidatePath,
  rebuildPath,
  candidateSha256: candidateSha,
  candidateTextMutation: true,
  trustPromotion: candidate.status === "textually_trusted_source_map_backed_pending_app_render_policy",
  appRenderPromotion: false,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair 3 Corinthians source-shaped rebuild.");
  process.exit(1);
}

console.log("ALL PASSED");
console.log("NEXT: 3 Corinthians source-shaped rebuild passed QC.");
