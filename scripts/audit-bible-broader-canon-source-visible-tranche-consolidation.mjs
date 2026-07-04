#!/usr/bin/env node
import fs from "node:fs";

const classificationPath = "data/bible/registry/broader-canon-source-visible-classification-2026-07-04.json";
const governancePath = "data/bible/registry/broader-canon-governance.json";
const statusPath = "data/bible/registry/bible-corpus-trust-status.json";
const recordPath = "data/bible/registry/broader-canon-source-visible-tranche-consolidation-2026-07-04.json";

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

const failures = [];
const classification = readJson(classificationPath);
const governance = readJson(governancePath);
const status = readJson(statusPath);
const record = readJson(recordPath);
const lane = status.lanes?.broader_canon;

const expected = [
  ["data/bible/OT/1enoch.json", "source_binding_collated_no_bible_text_mutation", "source_witness_collated"],
  ["data/bible/ET/bookofjubileesET.json", "source_page_binding_collated_no_candidate_mutation", "source_witness_collated"],
  ["data/bible/ET/ascensionofisaiahET.json", "blocked_source_basis_chapter_shape_mismatch_no_candidate_mutation", "source_visible_blocked"],
  ["data/bible/NT/2baruchCE.json", "blocked_online_witness_incomplete_tail_no_candidate_mutation", "source_visible_blocked"],
  ["data/bible/ODES/odesofsolomonSY.json", "blocked_candidate_fragmentary_source_scope_no_candidate_mutation", "source_visible_blocked"],
  ["data/bible/NT/epistleofthelaodiceans.json", "source_visible_exact_source_repair_recorded", "source_witness_collated_candidate_repaired"],
  ["data/bible/AR/3corinthiansAR.json", "blocked_modern_source_identity_no_bible_text_mutation", "source_visible_blocked"]
];

if (record.schema !== "broader-canon-source-visible-tranche-consolidation-v1") failures.push({ type: "record-schema-mismatch", actual: record.schema });
if (record.status !== "closed_source_visible_tranche_adjudicated_3_source_bound_or_repaired_4_blocked_no_global_trust_promotion") failures.push({ type: "record-status-mismatch", actual: record.status });
if (record.scope?.candidateCount !== 7) failures.push({ type: "record-candidate-count-mismatch", actual: record.scope?.candidateCount });
if (record.scope?.sourceBoundOrRepairedCount !== 3) failures.push({ type: "record-source-bound-count-mismatch", actual: record.scope?.sourceBoundOrRepairedCount });
if (record.scope?.blockedCount !== 4) failures.push({ type: "record-blocked-count-mismatch", actual: record.scope?.blockedCount });
if (record.scope?.globalBroaderCanonTextTrustPromotion !== false) failures.push({ type: "unexpected-global-text-trust-promotion" });
if (record.scope?.globalBroaderCanonAppRenderPromotion !== false) failures.push({ type: "unexpected-global-app-render-promotion" });
if (record.scope?.bibleVerseTextMutationInThisConsolidation !== false) failures.push({ type: "unexpected-consolidation-text-mutation" });

if (classification.status !== "closed_source_visible_tranche_adjudicated") failures.push({ type: "classification-status-mismatch", actual: classification.status });
if (classification.scope?.candidateCount !== 7) failures.push({ type: "classification-candidate-count-mismatch", actual: classification.scope?.candidateCount });

for (const [path, disposition, visibility] of expected) {
  const item = (classification.items || []).find(entry => entry.path === path);
  if (!item) {
    failures.push({ type: "missing-classification-item", path });
    continue;
  }
  if (item.currentDisposition !== disposition) failures.push({ type: "classification-disposition-mismatch", path, expected: disposition, actual: item.currentDisposition });
  if (item.sourceVisibility !== visibility) failures.push({ type: "classification-source-visibility-mismatch", path, expected: visibility, actual: item.sourceVisibility });
}

if (governance.sourceVisibleTrancheConsolidation?.recordPath !== recordPath) failures.push({ type: "governance-pointer-mismatch", actual: governance.sourceVisibleTrancheConsolidation?.recordPath || null });
if (governance.sourceVisibleTrancheConsolidation?.sourceBoundOrRepairedCount !== 3) failures.push({ type: "governance-source-bound-count-mismatch", actual: governance.sourceVisibleTrancheConsolidation?.sourceBoundOrRepairedCount });
if (governance.sourceVisibleTrancheConsolidation?.blockedCount !== 4) failures.push({ type: "governance-blocked-count-mismatch", actual: governance.sourceVisibleTrancheConsolidation?.blockedCount });

if (lane?.status !== "not_trusted_textually_broader_canon_candidates_quarantined_app_safe") failures.push({ type: "lane-status-mismatch", actual: lane?.status || null });
if (lane?.appUseTrustReady !== true) failures.push({ type: "lane-app-use-trust-ready-mismatch", actual: lane?.appUseTrustReady });
if (lane?.textTrustReady !== false) failures.push({ type: "lane-text-trust-ready-mismatch", actual: lane?.textTrustReady });
if (lane?.latest_broader_canon_source_visible_tranche_consolidation?.recordPath !== recordPath) failures.push({ type: "lane-pointer-mismatch", actual: lane?.latest_broader_canon_source_visible_tranche_consolidation?.recordPath || null });

for (const claim of record.allowedClaims || []) {
  if (!Array.isArray(governance.allowedClaims) || !governance.allowedClaims.includes(claim)) failures.push({ type: "missing-governance-allowed-claim", claim });
  if (!Array.isArray(lane?.allowedClaims) || !lane.allowedClaims.includes(claim)) failures.push({ type: "missing-lane-allowed-claim", claim });
}

for (const claim of record.blockedClaims || []) {
  if (!Array.isArray(governance.blockedClaims) || !governance.blockedClaims.includes(claim)) failures.push({ type: "missing-governance-blocked-claim", claim });
  if (!Array.isArray(lane?.blockedClaims) || !lane.blockedClaims.includes(claim)) failures.push({ type: "missing-lane-blocked-claim", claim });
}

console.log(JSON.stringify({
  audit: "broader-canon-source-visible-tranche-consolidation",
  status: failures.length ? "failed" : "passed",
  candidateCount: record.scope?.candidateCount,
  sourceBoundOrRepairedCount: record.scope?.sourceBoundOrRepairedCount,
  blockedCount: record.scope?.blockedCount,
  globalTextTrustPromotion: record.scope?.globalBroaderCanonTextTrustPromotion,
  globalAppRenderPromotion: record.scope?.globalBroaderCanonAppRenderPromotion,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair source-visible tranche consolidation.");
} else {
  console.log("ALL PASSED");
  console.log("NEXT: Source-visible broader-canon tranche is consolidated; proceed to remaining broader-canon source acquisition or a tranche status review.");
}

process.exit(failures.length ? 1 : 0);
