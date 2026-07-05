#!/usr/bin/env node
import fs from "node:fs";
import crypto from "node:crypto";

const pendingStatus = "rebuilt_complete_nuhra_source_snapshot_pending_collation";
const finalStatus = "app_render_eligible_textually_trusted_source_binding_backed";
const candidatePath = "data/bible/ODES/odesofsolomonSY.json";
const recordPath = "data/bible/registry/broader-canon-odesofsolomon-nuhra-rebuild-2026-07-05.json";
const bindingRecordPath = "data/bible/registry/broader-canon-odesofsolomon-source-binding-2026-07-05.json";
const governancePath = "data/bible/registry/broader-canon-governance.json";
const classificationPath = "data/bible/registry/broader-canon-source-visible-classification-2026-07-04.json";

function read(path) { return JSON.parse(fs.readFileSync(path, "utf8")); }
function sha(text) { return crypto.createHash("sha256").update(text).digest("hex"); }
function rows(candidate) {
  return (candidate.chapters || []).flatMap(ch =>
    (ch.verses || []).map(v => ({ ref: String(ch.num) + ":" + String(v.num), text: v.text || "" }))
  );
}
const failures = [];
function fail(type, detail) { failures.push(Object.assign({ type }, detail || {})); }
function eq(label, actual, expected) { if (actual !== expected) fail("mismatch", { label, actual, expected }); }
function truthy(label, actual) { if (actual !== true) fail("not-true", { label, actual }); }
function falsey(label, actual) { if (actual !== false) fail("not-false", { label, actual }); }
function includes(label, list, value) { if (!Array.isArray(list) || !list.includes(value)) fail("missing-list-value", { label, value }); }

const candidateText = fs.readFileSync(candidatePath, "utf8");
const candidate = JSON.parse(candidateText);
const record = read(recordPath);
const governance = read(governancePath);
const classification = read(classificationPath);
const metadata = read(record.rawSourceMetadataPath);
const candidateRows = rows(candidate);
const finalMode = candidate.status === finalStatus;
const expectedCandidateStatus = finalMode ? finalStatus : pendingStatus;

eq("candidate status", candidate.status, expectedCandidateStatus);
eq("record status", record.status, pendingStatus);
eq("chapter count", candidate.chapters.length, 42);
eq("row count", candidateRows.length, 522);
truthy("bible mutation recorded", record.repair?.bibleVerseTextMutation);
eq("candidate file sha", record.trustBoundary?.candidateFileSha256, sha(candidateText));
truthy("metadata public domain", metadata.diagnostic?.publicDomainStatementDetected);
eq("metadata chapter count", metadata.diagnostic?.rebuiltChapterCount, 42);
eq("metadata row count", metadata.diagnostic?.rebuiltRowCount, candidateRows.length);
truthy("cleanup recorded", record.cleanup?.status === "parser_contamination_removed");

for (const row of candidateRows) {
  const rowText = String(row.text || "");
  if (rowText.includes("A hypothetical reconstruction") || rowText.includes("<!--") || rowText.includes("-->") || rowText.includes("&lt;") || rowText.includes("&gt;") || rowText.trim().endsWith("(From")) {
    fail("parser-contamination-check", { ref: row.ref, text: row.text });
  }
}

if (finalMode) {
  const binding = read(bindingRecordPath);
  eq("binding record status", binding.status, finalStatus);
  eq("binding record path", record.trustBoundary?.sourceBindingRecordPath, bindingRecordPath);
  truthy("record collation complete", record.trustBoundary?.rowLevelCollationComplete);
  truthy("binding text trust", binding.trustBoundary?.textTrustPromotion);
  truthy("binding app render", binding.trustBoundary?.appRenderPromotion);
} else {
  falsey("text trust promotion", record.trustBoundary?.textTrustPromotion);
  falsey("app render promotion", record.trustBoundary?.appRenderPromotion);
  falsey("row collation complete", record.trustBoundary?.rowLevelCollationComplete);
}

eq("governance rebuild latest", governance.latestOdesOfSolomonNuhraRebuild?.recordPath, recordPath);
truthy("governance bible mutation", governance.latestOdesOfSolomonNuhraRebuild?.bibleTextMutation);
includes("allowedClaims", governance.allowedClaims, "broader_canon_odesofsolomon_complete_candidate_rebuilt_from_nuhra_public_domain_source");
includes("allowedClaims", governance.allowedClaims, "broader_canon_odesofsolomon_fragmentary_exclusion_superseded_by_complete_rebuild");

if (finalMode) {
  eq("governance binding latest", governance.latestOdesOfSolomonSourceBinding?.recordPath, bindingRecordPath);
  eq("classification binding latest", classification.odesOfSolomonSourceBinding?.recordPath, bindingRecordPath);
} else {
  eq("classification rebuild latest", classification.odesOfSolomonNuhraRebuild?.recordPath, recordPath);
}

console.log(JSON.stringify({
  audit: "broader-canon-odesofsolomon-nuhra-rebuild",
  status: failures.length ? "failed" : "passed",
  candidatePath,
  recordPath,
  chapterCount: candidate.chapters.length,
  rowCount: candidateRows.length,
  candidateStatus: candidate.status,
  sourceBindingMode: finalMode,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair Odes Nuhra rebuild/source binding records.");
  process.exitCode = 1;
} else {
  console.log("ALL PASSED");
  console.log("NEXT: Odes Nuhra rebuild/source binding audit passed.");
}
