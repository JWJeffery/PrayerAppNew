#!/usr/bin/env node
import fs from "node:fs";

const candidatePath = "data/bible/ET/ascensionofisaiahET.json";
const governancePath = "data/bible/registry/broader-canon-governance.json";
const statusPath = "data/bible/registry/bible-corpus-trust-status.json";
const recordPath = "data/bible/registry/broader-canon-source-basis-blocker-ascensionofisaiah-2026-07-04.json";

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

const failures = [];
const candidate = readJson(candidatePath);
const governance = readJson(governancePath);
const status = readJson(statusPath);
const record = readJson(recordPath);
const lane = status.lanes?.broader_canon;

const rows = (candidate.chapters || []).flatMap(chapter => chapter.verses || []);
const chapter4 = (candidate.chapters || []).find(chapter => Number(chapter.num) === 4);

if (rows.length !== 140) failures.push({ type: "candidate-row-count-mismatch", actual: rows.length });
if (!String(chapter4?.verses?.[0]?.text || "").startsWith("For Beliar was in great wrath")) failures.push({ type: "chapter4-anchor-mismatch" });

if (record.schema !== "broader-canon-source-basis-blocker-ascensionofisaiah-v1") failures.push({ type: "record-schema-mismatch", actual: record.schema });
if (record.status !== "blocked_source_basis_chapter_shape_mismatch_no_candidate_mutation") failures.push({ type: "record-status-mismatch", actual: record.status });
if (record.scope?.candidatePath !== candidatePath) failures.push({ type: "candidate-path-mismatch", actual: record.scope?.candidatePath });
if (record.scope?.bibleVerseTextMutation !== false) failures.push({ type: "unexpected-bible-verse-text-mutation" });
if (record.scope?.candidateJsonMutation !== false) failures.push({ type: "unexpected-candidate-json-mutation" });
if (record.finding?.blockerType !== "source_basis_chapter_shape_mismatch") failures.push({ type: "blocker-type-mismatch", actual: record.finding?.blockerType });

if (governance.sourceBasisBlockerAscensionOfIsaiah?.recordPath !== recordPath) failures.push({ type: "governance-pointer-mismatch", actual: governance.sourceBasisBlockerAscensionOfIsaiah?.recordPath || null });
if (governance.sourceBasisBlockerAscensionOfIsaiah?.candidateJsonMutation !== false) failures.push({ type: "governance-candidate-json-mutation-mismatch", actual: governance.sourceBasisBlockerAscensionOfIsaiah?.candidateJsonMutation });

if (lane?.status !== "not_trusted_textually_broader_canon_candidates_quarantined_app_safe") failures.push({ type: "lane-status-mismatch", actual: lane?.status || null });
if (lane?.appUseTrustReady !== true) failures.push({ type: "lane-app-use-trust-ready-mismatch", actual: lane?.appUseTrustReady });
if (lane?.textTrustReady !== false) failures.push({ type: "lane-text-trust-ready-mismatch", actual: lane?.textTrustReady });

for (const claim of record.blockedClaims || []) {
  if (!Array.isArray(lane?.blockedClaims) || !lane.blockedClaims.includes(claim)) {
    failures.push({ type: "missing-lane-blocked-claim", claim });
  }
}

console.log(JSON.stringify({
  audit: "broader-canon-source-basis-blocker-ascensionofisaiah",
  status: failures.length ? "failed" : "passed",
  candidateRowCount: rows.length,
  blockerType: record.finding?.blockerType || null,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair Ascension of Isaiah source-basis blocker record.");
} else {
  console.log("ALL PASSED");
  console.log("NEXT: Ascension of Isaiah source-basis blocker is governed; proceed to next R.H. Charles candidate or source-basis search.");
}

process.exit(failures.length ? 1 : 0);
