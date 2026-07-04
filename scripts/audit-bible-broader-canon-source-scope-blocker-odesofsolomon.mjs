#!/usr/bin/env node
import fs from "node:fs";

const candidatePath = "data/bible/ODES/odesofsolomonSY.json";
const governancePath = "data/bible/registry/broader-canon-governance.json";
const statusPath = "data/bible/registry/bible-corpus-trust-status.json";
const recordPath = "data/bible/registry/broader-canon-source-scope-blocker-odesofsolomon-2026-07-04.json";

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

if (chapters.length !== 1) failures.push({ type: "candidate-chapter-count-mismatch", actual: chapters.length });
if (rows.length !== 3) failures.push({ type: "candidate-row-count-mismatch", actual: rows.length });
if (!String(rows[0]?.text || "").startsWith("The Lord is on my head like a crown")) failures.push({ type: "ode-1-1-anchor-mismatch" });

if (record.schema !== "broader-canon-source-scope-blocker-odesofsolomon-v1") failures.push({ type: "record-schema-mismatch", actual: record.schema });
if (record.status !== "blocked_candidate_fragmentary_source_scope_no_candidate_mutation") failures.push({ type: "record-status-mismatch", actual: record.status });
if (record.scope?.candidatePath !== candidatePath) failures.push({ type: "candidate-path-mismatch", actual: record.scope?.candidatePath });
if (record.scope?.bibleVerseTextMutation !== false) failures.push({ type: "unexpected-bible-verse-text-mutation" });
if (record.scope?.candidateJsonMutation !== false) failures.push({ type: "unexpected-candidate-json-mutation" });
if (record.scope?.broaderCanonTextTrustPromotion !== false) failures.push({ type: "unexpected-text-trust-promotion" });
if (record.scope?.broaderCanonAppRenderPromotion !== false) failures.push({ type: "unexpected-app-render-promotion" });
if (record.finding?.blockerType !== "candidate_fragmentary_source_scope") failures.push({ type: "blocker-type-mismatch", actual: record.finding?.blockerType });

if (governance.sourceScopeBlockerOdesOfSolomon?.recordPath !== recordPath) failures.push({ type: "governance-pointer-mismatch", actual: governance.sourceScopeBlockerOdesOfSolomon?.recordPath || null });
if (governance.sourceScopeBlockerOdesOfSolomon?.candidateJsonMutation !== false) failures.push({ type: "governance-candidate-json-mutation-mismatch", actual: governance.sourceScopeBlockerOdesOfSolomon?.candidateJsonMutation });

if (lane?.status !== "not_trusted_textually_broader_canon_candidates_quarantined_app_safe") failures.push({ type: "lane-status-mismatch", actual: lane?.status || null });
if (lane?.appUseTrustReady !== true) failures.push({ type: "lane-app-use-trust-ready-mismatch", actual: lane?.appUseTrustReady });
if (lane?.textTrustReady !== false) failures.push({ type: "lane-text-trust-ready-mismatch", actual: lane?.textTrustReady });
if (lane?.latest_broader_canon_source_scope_blocker_odesofsolomon?.recordPath !== recordPath) failures.push({ type: "lane-pointer-mismatch", actual: lane?.latest_broader_canon_source_scope_blocker_odesofsolomon?.recordPath || null });

for (const claim of record.blockedClaims || []) {
  if (!Array.isArray(governance.blockedClaims) || !governance.blockedClaims.includes(claim)) {
    failures.push({ type: "missing-governance-blocked-claim", claim });
  }
  if (!Array.isArray(lane?.blockedClaims) || !lane.blockedClaims.includes(claim)) {
    failures.push({ type: "missing-lane-blocked-claim", claim });
  }
}

console.log(JSON.stringify({
  audit: "broader-canon-source-scope-blocker-odesofsolomon",
  status: failures.length ? "failed" : "passed",
  candidateChapterCount: chapters.length,
  candidateRowCount: rows.length,
  blockerType: record.finding?.blockerType || null,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair Odes of Solomon source-scope blocker record.");
} else {
  console.log("ALL PASSED");
  console.log("NEXT: Odes of Solomon source-scope blocker is governed; proceed to next source-visible candidate inspection.");
}

process.exit(failures.length ? 1 : 0);
