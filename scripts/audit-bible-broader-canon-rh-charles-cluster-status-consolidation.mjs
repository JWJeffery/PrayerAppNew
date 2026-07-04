#!/usr/bin/env node
import fs from "node:fs";

const governancePath = "data/bible/registry/broader-canon-governance.json";
const statusPath = "data/bible/registry/bible-corpus-trust-status.json";
const witnessPath = "data/bible/registry/broader-canon-rh-charles-source-witnesses-2026-07-04.json";
const recordPath = "data/bible/registry/broader-canon-rh-charles-cluster-status-consolidation-2026-07-04.json";

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

const failures = [];
const governance = readJson(governancePath);
const status = readJson(statusPath);
const witnessRecord = readJson(witnessPath);
const record = readJson(recordPath);
const lane = status.lanes?.broader_canon;

const expectedWitnessPaths = [
  "data/bible/OT/1enoch.json",
  "data/bible/ET/bookofjubileesET.json",
  "data/bible/ET/ascensionofisaiahET.json",
  "data/bible/NT/2baruchCE.json"
].sort();

const actualWitnessPaths = (witnessRecord.items || []).map(item => item.path).sort();

if (record.schema !== "broader-canon-rh-charles-cluster-status-consolidation-v1") failures.push({ type: "schema-mismatch", actual: record.schema });
if (record.status !== "closed_status_consolidated_collated_2_blocked_2_no_trust_promotion") failures.push({ type: "status-mismatch", actual: record.status });
if (record.scope?.bibleVerseTextMutation !== false) failures.push({ type: "unexpected-bible-verse-text-mutation" });
if (record.scope?.candidateJsonMutation !== false) failures.push({ type: "unexpected-candidate-json-mutation" });
if (record.scope?.broaderCanonTextTrustPromotion !== false) failures.push({ type: "unexpected-text-trust-promotion" });
if (record.scope?.broaderCanonAppRenderPromotion !== false) failures.push({ type: "unexpected-app-render-promotion" });

if (JSON.stringify(actualWitnessPaths) !== JSON.stringify(expectedWitnessPaths)) {
  failures.push({ type: "witness-paths-mismatch", expected: expectedWitnessPaths, actual: actualWitnessPaths });
}

if (record.clusterSummary?.candidateCount !== 4) failures.push({ type: "candidate-count-mismatch", actual: record.clusterSummary?.candidateCount });
if (record.clusterSummary?.sourceBindingCollatedCount !== 2) failures.push({ type: "collated-count-mismatch", actual: record.clusterSummary?.sourceBindingCollatedCount });
if (record.clusterSummary?.sourceBasisBlockedCount !== 2) failures.push({ type: "blocked-count-mismatch", actual: record.clusterSummary?.sourceBasisBlockedCount });

const collationRecords = record.clusterSummary?.sourceBindingCollatedCandidates || [];
const blockerRecords = record.clusterSummary?.sourceBasisBlockedCandidates || [];

if (!collationRecords.some(item => item.candidatePath === "data/bible/OT/1enoch.json")) failures.push({ type: "missing-1enoch-collation" });
if (!collationRecords.some(item => item.candidatePath === "data/bible/ET/bookofjubileesET.json")) failures.push({ type: "missing-jubilees-collation" });
if (!blockerRecords.some(item => item.candidatePath === "data/bible/ET/ascensionofisaiahET.json" && item.blockerType === "source_basis_chapter_shape_mismatch")) failures.push({ type: "missing-ascension-blocker" });
if (!blockerRecords.some(item => item.candidatePath === "data/bible/NT/2baruchCE.json" && item.blockerType === "online_witness_incomplete_tail")) failures.push({ type: "missing-2baruch-blocker" });

if (governance.rhCharlesClusterStatusConsolidation?.recordPath !== recordPath) failures.push({ type: "governance-pointer-mismatch", actual: governance.rhCharlesClusterStatusConsolidation?.recordPath || null });
if (governance.rhCharlesClusterStatusConsolidation?.sourceBindingCollatedCount !== 2) failures.push({ type: "governance-collated-count-mismatch", actual: governance.rhCharlesClusterStatusConsolidation?.sourceBindingCollatedCount });
if (governance.rhCharlesClusterStatusConsolidation?.sourceBasisBlockedCount !== 2) failures.push({ type: "governance-blocked-count-mismatch", actual: governance.rhCharlesClusterStatusConsolidation?.sourceBasisBlockedCount });

if (lane?.status !== "not_trusted_textually_broader_canon_candidates_quarantined_app_safe") failures.push({ type: "lane-status-mismatch", actual: lane?.status || null });
if (lane?.appUseTrustReady !== true) failures.push({ type: "lane-app-use-trust-ready-mismatch", actual: lane?.appUseTrustReady });
if (lane?.textTrustReady !== false) failures.push({ type: "lane-text-trust-ready-mismatch", actual: lane?.textTrustReady });
if (lane?.latest_broader_canon_rh_charles_cluster_status_consolidation?.recordPath !== recordPath) failures.push({ type: "lane-pointer-mismatch", actual: lane?.latest_broader_canon_rh_charles_cluster_status_consolidation?.recordPath || null });

for (const claim of record.blockedClaims || []) {
  if (!Array.isArray(governance.blockedClaims) || !governance.blockedClaims.includes(claim)) {
    failures.push({ type: "missing-governance-blocked-claim", claim });
  }
  if (!Array.isArray(lane?.blockedClaims) || !lane.blockedClaims.includes(claim)) {
    failures.push({ type: "missing-lane-blocked-claim", claim });
  }
}

console.log(JSON.stringify({
  audit: "broader-canon-rh-charles-cluster-status-consolidation",
  status: failures.length ? "failed" : "passed",
  candidateCount: record.clusterSummary?.candidateCount || null,
  sourceBindingCollatedCount: record.clusterSummary?.sourceBindingCollatedCount || null,
  sourceBasisBlockedCount: record.clusterSummary?.sourceBasisBlockedCount || null,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair R.H. Charles cluster status consolidation.");
} else {
  console.log("ALL PASSED");
  console.log("NEXT: R.H. Charles cluster status is consolidated; proceed to next broader-canon source-visible cluster.");
}

process.exit(failures.length ? 1 : 0);
