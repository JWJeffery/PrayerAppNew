#!/usr/bin/env node
import fs from "node:fs";

const candidatePath = "data/bible/NT/2baruchCE.json";
const governancePath = "data/bible/registry/broader-canon-governance.json";
const statusPath = "data/bible/registry/bible-corpus-trust-status.json";
const recordPath = "data/bible/registry/broader-canon-source-basis-blocker-2baruch-2026-07-04.json";

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

const failures = [];
const candidate = readJson(candidatePath);
const governance = readJson(governancePath);
const status = readJson(statusPath);
const record = readJson(recordPath);
const lane = status.lanes?.broader_canon;

const chapters = candidate.chapters || [];
const rows = chapters.flatMap(chapter => chapter.verses || []);
const chapter85 = chapters.find(chapter => Number(chapter.num) === 85);
const chapter86 = chapters.find(chapter => Number(chapter.num) === 86);
const chapter87 = chapters.find(chapter => Number(chapter.num) === 87);

if (chapters.length !== 87) failures.push({ type: "candidate-chapter-count-mismatch", actual: chapters.length });
if (!chapter85 || !chapter86 || !chapter87) failures.push({ type: "candidate-tail-chapters-missing" });
if (!String(chapter85?.verses?.[0]?.text || "").startsWith("Know, therefore")) failures.push({ type: "chapter85-anchor-mismatch" });
if (!String(chapter86?.verses?.[0]?.text || "").startsWith("Therefore, when you receive")) failures.push({ type: "chapter86-anchor-mismatch" });
if (!String(chapter87?.verses?.[0]?.text || "").startsWith("And it happened")) failures.push({ type: "chapter87-anchor-mismatch" });

if (record.schema !== "broader-canon-source-basis-blocker-2baruch-v1") failures.push({ type: "record-schema-mismatch", actual: record.schema });
if (record.status !== "blocked_online_witness_incomplete_tail_no_candidate_mutation") failures.push({ type: "record-status-mismatch", actual: record.status });
if (record.scope?.candidatePath !== candidatePath) failures.push({ type: "candidate-path-mismatch", actual: record.scope?.candidatePath });
if (record.scope?.bibleVerseTextMutation !== false) failures.push({ type: "unexpected-bible-verse-text-mutation" });
if (record.scope?.candidateJsonMutation !== false) failures.push({ type: "unexpected-candidate-json-mutation" });
if (record.finding?.blockerType !== "online_witness_incomplete_tail") failures.push({ type: "blocker-type-mismatch", actual: record.finding?.blockerType });

if (governance.sourceBasisBlocker2Baruch?.recordPath !== recordPath) failures.push({ type: "governance-pointer-mismatch", actual: governance.sourceBasisBlocker2Baruch?.recordPath || null });
if (governance.sourceBasisBlocker2Baruch?.candidateJsonMutation !== false) failures.push({ type: "governance-candidate-json-mutation-mismatch", actual: governance.sourceBasisBlocker2Baruch?.candidateJsonMutation });

if (lane?.status !== "not_trusted_textually_broader_canon_candidates_quarantined_app_safe") failures.push({ type: "lane-status-mismatch", actual: lane?.status || null });
if (lane?.appUseTrustReady !== true) failures.push({ type: "lane-app-use-trust-ready-mismatch", actual: lane?.appUseTrustReady });
if (lane?.textTrustReady !== false) failures.push({ type: "lane-text-trust-ready-mismatch", actual: lane?.textTrustReady });

for (const claim of record.blockedClaims || []) {
  if (!Array.isArray(lane?.blockedClaims) || !lane.blockedClaims.includes(claim)) {
    failures.push({ type: "missing-lane-blocked-claim", claim });
  }
}

console.log(JSON.stringify({
  audit: "broader-canon-source-basis-blocker-2baruch",
  status: failures.length ? "failed" : "passed",
  candidateChapterCount: chapters.length,
  candidateRowCount: rows.length,
  blockerType: record.finding?.blockerType || null,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair 2 Baruch source-basis blocker record.");
} else {
  console.log("ALL PASSED");
  console.log("NEXT: 2 Baruch source-basis blocker is governed; R.H. Charles cluster source-basis pass is closed except future complete-source acquisition.");
}

process.exit(failures.length ? 1 : 0);
