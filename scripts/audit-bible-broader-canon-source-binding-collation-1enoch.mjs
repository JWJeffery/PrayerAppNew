#!/usr/bin/env node
import fs from "node:fs";

const recordPath = "data/bible/registry/broader-canon-source-binding-collation-1enoch-2026-07-04.json";
const governancePath = "data/bible/registry/broader-canon-governance.json";
const statusPath = "data/bible/registry/bible-corpus-trust-status.json";
const candidatePath = "data/bible/OT/1enoch.json";

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

const failures = [];
const record = readJson(recordPath);
const governance = readJson(governancePath);
const status = readJson(statusPath);
const lane = status.lanes?.broader_canon;

if (record.schema !== "broader-canon-source-binding-collation-1enoch-v4") failures.push({ type: "schema-mismatch", actual: record.schema });
if (record.status !== "passed_fixed_entity_source_binding_collation_no_bible_verse_text_mutation") failures.push({ type: "status-mismatch", actual: record.status });
if (record.scope?.candidatePath !== candidatePath) failures.push({ type: "candidate-path-mismatch", actual: record.scope?.candidatePath });
if (record.scope?.bibleVerseTextMutation !== false) failures.push({ type: "unexpected-bible-verse-text-mutation" });
if (record.scope?.candidateJsonMutation !== false) failures.push({ type: "unexpected-candidate-json-mutation" });
if (record.validation?.repoRowCount !== 1048) failures.push({ type: "repo-row-count-mismatch", actual: record.validation?.repoRowCount });
if (record.validation?.bindingCount !== 1048) failures.push({ type: "binding-count-mismatch", actual: record.validation?.bindingCount });
if (record.validation?.failureCount !== 0) failures.push({ type: "failure-count-not-zero", actual: record.validation?.failureCount });

const classes = record.validation?.acceptanceClassCounts || {};
const accepted = Object.values(classes).reduce((sum, value) => sum + Number(value || 0), 0);
if (accepted !== 1048) failures.push({ type: "acceptance-class-total-mismatch", actual: accepted });

const manualRows = record.validation?.manualVerifiedRows || [];
if (manualRows.length !== 1 || manualRows[0]?.ref !== "6:7") failures.push({ type: "manual-verification-row-mismatch", actual: manualRows });
if (classes.manual_verified_transliteration_6_7 !== 1) failures.push({ type: "manual-verification-class-count-mismatch", actual: classes.manual_verified_transliteration_6_7 });

if (governance.sourceBindingCollation1Enoch?.recordPath !== recordPath) failures.push({ type: "governance-pointer-mismatch", actual: governance.sourceBindingCollation1Enoch?.recordPath || null });
if (governance.sourceBindingCollation1Enoch?.candidateJsonMutation !== false) failures.push({ type: "governance-candidate-json-mutation-mismatch", actual: governance.sourceBindingCollation1Enoch?.candidateJsonMutation });

if (lane?.status !== "not_trusted_textually_broader_canon_candidates_quarantined_app_safe") failures.push({ type: "lane-status-mismatch", actual: lane?.status || null });
if (lane?.appUseTrustReady !== true) failures.push({ type: "lane-app-use-trust-ready-mismatch", actual: lane?.appUseTrustReady });
if (lane?.textTrustReady !== false) failures.push({ type: "lane-text-trust-ready-mismatch", actual: lane?.textTrustReady });
if (!Array.isArray(lane?.sourceBackedAppUseCandidates) || !lane.sourceBackedAppUseCandidates.includes(candidatePath)) failures.push({ type: "missing-source-backed-app-use-candidate" });

for (const claim of record.allowedClaims || []) {
  if (!Array.isArray(lane?.allowedClaims) || !lane.allowedClaims.includes(claim)) failures.push({ type: "missing-lane-allowed-claim", claim });
}

for (const claim of record.blockedClaims || []) {
  if (!Array.isArray(lane?.blockedClaims) || !lane.blockedClaims.includes(claim)) failures.push({ type: "missing-lane-blocked-claim", claim });
}

console.log(JSON.stringify({
  audit: "broader-canon-source-binding-collation-1enoch",
  status: failures.length ? "failed" : "passed",
  repoRowCount: record.validation?.repoRowCount || null,
  bindingCount: record.validation?.bindingCount || null,
  acceptanceClassCounts: record.validation?.acceptanceClassCounts || {},
  manualVerifiedRows: record.validation?.manualVerifiedRows || [],
  belowDirectAcceptedCount: record.validation?.belowDirectAcceptedCount || 0,
  minimumScore: record.validation?.minimumScore || null,
  averageScore: record.validation?.averageScore || null,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair 1 Enoch fixed-entity source-binding collation record.");
} else {
  console.log("ALL PASSED");
  console.log("NEXT: 1 Enoch fixed-entity source-binding collation is governed; proceed to Jubilees source-shape inspection.");
}

process.exit(failures.length ? 1 : 0);
