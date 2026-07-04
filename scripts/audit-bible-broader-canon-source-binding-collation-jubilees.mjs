#!/usr/bin/env node
import fs from "node:fs";

const candidatePath = "data/bible/ET/bookofjubileesET.json";
const recordPath = "data/bible/registry/broader-canon-source-binding-collation-jubilees-2026-07-04.json";
const governancePath = "data/bible/registry/broader-canon-governance.json";
const statusPath = "data/bible/registry/bible-corpus-trust-status.json";

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function rows(candidate) {
  return (candidate.chapters || []).flatMap(chapter => (chapter.verses || []).map(verse => ({ ref: chapter.num + ":" + verse.num })));
}

const failures = [];
const candidate = readJson(candidatePath);
const record = readJson(recordPath);
const governance = readJson(governancePath);
const status = readJson(statusPath);
const lane = status.lanes?.broader_canon;
const candidateRows = rows(candidate);

if (candidateRows.length !== 975) failures.push({ type: "candidate-row-count-mismatch", actual: candidateRows.length });
if (record.schema !== "broader-canon-source-binding-collation-jubilees-v4") failures.push({ type: "record-schema-mismatch", actual: record.schema });
if (record.status !== "passed_source_page_binding_collation_no_candidate_mutation") failures.push({ type: "record-status-mismatch", actual: record.status });
if (record.scope?.bibleVerseTextMutation !== false) failures.push({ type: "unexpected-bible-verse-text-mutation" });
if (record.scope?.candidateJsonMutation !== false) failures.push({ type: "unexpected-candidate-json-mutation" });
if (record.validation?.repoRowCount !== 975) failures.push({ type: "record-row-count-mismatch", actual: record.validation?.repoRowCount });
if (record.validation?.bindingCount !== 975) failures.push({ type: "binding-count-mismatch", actual: record.validation?.bindingCount });
if (record.validation?.failureCount !== 0) failures.push({ type: "failure-count-not-zero", actual: record.validation?.failureCount });

const classes = record.validation?.acceptanceClassCounts || {};
const accepted = Object.values(classes).reduce((sum, value) => sum + Number(value || 0), 0);
if (accepted !== 975) failures.push({ type: "acceptance-class-total-mismatch", actual: accepted });

const requiredManualRefs = ["1:6", "12:37", "23:33", "38:5", "39:19", "39:20", "40:14", "40:15", "40:16", "40:17", "40:18", "41:23", "41:24", "43:23", "43:24"];
const manualRefs = new Set(record.validation?.manualRowRefs || []);
for (const ref of requiredManualRefs) {
  if (!manualRefs.has(ref)) failures.push({ type: "missing-manual-row-ref", ref });
}

if (governance.sourceBindingCollationJubilees?.recordPath !== recordPath) failures.push({ type: "governance-collation-pointer-mismatch", actual: governance.sourceBindingCollationJubilees?.recordPath || null });
if (governance.sourceBindingCollationJubilees?.candidateJsonMutation !== false) failures.push({ type: "governance-candidate-json-mutation-mismatch", actual: governance.sourceBindingCollationJubilees?.candidateJsonMutation });

if (lane?.status !== "not_trusted_textually_broader_canon_candidates_quarantined_app_safe") failures.push({ type: "lane-status-mismatch", actual: lane?.status || null });
if (lane?.appUseTrustReady !== true) failures.push({ type: "lane-app-use-trust-ready-mismatch", actual: lane?.appUseTrustReady });
if (!Array.isArray(lane?.sourceBackedAppUseCandidates) || !lane.sourceBackedAppUseCandidates.includes(candidatePath)) failures.push({ type: "missing-source-backed-app-use-candidate" });

console.log(JSON.stringify({
  audit: "broader-canon-source-binding-collation-jubilees",
  status: failures.length ? "failed" : "passed",
  candidateRowCount: candidateRows.length,
  bindingCount: record.validation?.bindingCount || null,
  acceptanceClassCounts: record.validation?.acceptanceClassCounts || {},
  manualRowRefs: record.validation?.manualRowRefs || [],
  minimumScore: record.validation?.minimumScore || null,
  averageScore: record.validation?.averageScore || null,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair Jubilees source-page binding collation.");
} else {
  console.log("ALL PASSED");
  console.log("NEXT: Jubilees source-page binding collation is governed.");
}

process.exit(failures.length ? 1 : 0);
