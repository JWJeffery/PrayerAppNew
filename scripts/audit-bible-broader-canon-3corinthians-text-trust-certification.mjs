import fs from "node:fs";

const failures = [];

const candidatePath = "data/bible/AR/3corinthiansAR.json";
const sourceMapPath = "data/bible/registry/broader-canon-3corinthians-mr-james-source-map-2026-07-04.json";
const certPath = "data/bible/registry/broader-canon-3corinthians-text-trust-certification-2026-07-04.json";

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

const candidate = read(candidatePath);
const sourceMap = read(sourceMapPath);
const cert = read(certPath);

const sourceRows = sourceMap.sourceMap.filter(row => row.sourceUnitType === "numbered_source_row");
const candidateRows = (candidate.chapters || []).flatMap(chapter => chapter.verses || []);

if (![
  "textually_trusted_source_map_backed_pending_app_render_policy",
  "app_render_eligible_textually_trusted_source_map_backed"
].includes(candidate.status)) {
  fail("bad-candidate-status", { actual: candidate.status });
}

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

eq("cert status", cert.status, "certified_textually_trusted_source_map_backed_pending_app_render_policy");
truthy("cert text trust", cert.trustBoundary?.candidateTextCertifiedTrusted);
truthy("cert trust promotion", cert.trustBoundary?.trustPromotion);

console.log(JSON.stringify({
  audit: "broader-canon-3corinthians-text-trust-certification",
  status: failures.length ? "failed" : "passed",
  certPath,
  candidateStatus: candidate.status,
  textTrust: true,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair 3 Corinthians text-trust certification.");
  process.exit(1);
}

console.log("ALL PASSED");
console.log("NEXT: 3 Corinthians text-trust certification passed QC.");
