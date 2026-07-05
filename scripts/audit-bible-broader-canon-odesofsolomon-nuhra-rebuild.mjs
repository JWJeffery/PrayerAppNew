#!/usr/bin/env node
import fs from "node:fs";
import crypto from "node:crypto";

const candidatePath = "data/bible/ODES/odesofsolomonSY.json";
const recordPath = "data/bible/registry/broader-canon-odesofsolomon-nuhra-rebuild-2026-07-05.json";
const governancePath = "data/bible/registry/broader-canon-governance.json";
const classificationPath = "data/bible/registry/broader-canon-source-visible-classification-2026-07-04.json";
const status = "rebuilt_complete_nuhra_source_snapshot_pending_collation";

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

eq("candidate status", candidate.status, status);
eq("record status", record.status, status);
eq("chapter count", candidate.chapters.length, 42);
if (candidateRows.length < 250) fail("row-count-too-low", { actual: candidateRows.length });
truthy("bible mutation recorded", record.repair?.bibleVerseTextMutation);
falsey("text trust promotion", record.trustBoundary?.textTrustPromotion);
falsey("app render promotion", record.trustBoundary?.appRenderPromotion);
falsey("row collation complete", record.trustBoundary?.rowLevelCollationComplete);
eq("candidate file sha", record.trustBoundary?.candidateFileSha256, sha(candidateText));
truthy("metadata public domain", metadata.diagnostic?.publicDomainStatementDetected);
eq("metadata chapter count", metadata.diagnostic?.rebuiltChapterCount, 42);
eq("metadata row count", metadata.diagnostic?.rebuiltRowCount, candidateRows.length);
if (!String(candidate.chapters[0]?.verses?.[0]?.text || "").startsWith("The Lord is upon my head like a wreath")) fail("ode-1-anchor-mismatch");
if (candidate.chapters[41]?.num !== 42) fail("ode-42-missing");
for (const row of candidateRows) {
  const rowText = String(row.text || "");
  if (rowText.includes("A hypothetical reconstruction") || rowText.includes("<!--") || rowText.includes("-->") || rowText.includes("&lt;") || rowText.includes("&gt;") || rowText.trim().endsWith("(From")) {
    fail("parser-contamination-check", { ref: row.ref, text: row.text });
  }
}
truthy("cleanup recorded", record.cleanup?.status === "parser_contamination_removed");

eq("governance latest", governance.latestOdesOfSolomonNuhraRebuild?.recordPath, recordPath);
truthy("governance bible mutation", governance.latestOdesOfSolomonNuhraRebuild?.bibleTextMutation);
falsey("governance text trust", governance.latestOdesOfSolomonNuhraRebuild?.textTrustPromotion);
falsey("governance app render", governance.latestOdesOfSolomonNuhraRebuild?.appRenderPromotion);
falsey("governance collation", governance.latestOdesOfSolomonNuhraRebuild?.rowLevelCollationComplete);
includes("allowedClaims", governance.allowedClaims, "broader_canon_odesofsolomon_complete_candidate_rebuilt_from_nuhra_public_domain_source");
includes("allowedClaims", governance.allowedClaims, "broader_canon_odesofsolomon_fragmentary_exclusion_superseded_by_complete_rebuild");
includes("blockedClaims", governance.blockedClaims, "broader_canon_odesofsolomon_text_trust_from_rebuild_without_collation");
includes("blockedClaims", governance.blockedClaims, "broader_canon_odesofsolomon_app_render_from_rebuild_without_collation");

eq("classification latest", classification.odesOfSolomonNuhraRebuild?.recordPath, recordPath);
truthy("classification bible mutation", classification.odesOfSolomonNuhraRebuild?.bibleTextMutation);
falsey("classification text trust", classification.odesOfSolomonNuhraRebuild?.textTrust);
falsey("classification app render", classification.odesOfSolomonNuhraRebuild?.appRenderPromotion);

console.log(JSON.stringify({
  audit: "broader-canon-odesofsolomon-nuhra-rebuild",
  status: failures.length ? "failed" : "passed",
  candidatePath,
  recordPath,
  chapterCount: candidate.chapters.length,
  rowCount: candidateRows.length,
  bibleTextMutation: true,
  textTrust: false,
  appRenderEligible: false,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair Odes Nuhra rebuild.");
  process.exit(1);
}
console.log("ALL PASSED");
console.log("NEXT: Odes Nuhra rebuild passed QC; collation remains separate.");
