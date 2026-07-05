#!/usr/bin/env node
import fs from "node:fs";
import crypto from "node:crypto";

const finalStatus = "app_render_eligible_textually_trusted_source_binding_backed";
const candidatePath = "data/bible/ODES/odesofsolomonSY.json";
const bindingRecordPath = "data/bible/registry/broader-canon-odesofsolomon-source-binding-2026-07-05.json";
const governancePath = "data/bible/registry/broader-canon-governance.json";
const classificationPath = "data/bible/registry/broader-canon-source-visible-classification-2026-07-04.json";

function sha(text) { return crypto.createHash("sha256").update(text).digest("hex"); }
function read(path) { return JSON.parse(fs.readFileSync(path, "utf8")); }
function rows(candidate) {
  return (candidate.chapters || []).flatMap(ch =>
    (ch.verses || []).map(v => ({ ref: String(ch.num) + ":" + String(v.num), text: v.text || "" }))
  );
}
function sourceTextFromHtml(html) {
  return String(html || "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|blockquote)>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&lsquo;|&rsquo;/g, "'")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function norm(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

const failures = [];
function fail(type, detail) { failures.push(Object.assign({ type }, detail || {})); }
function eq(label, actual, expected) { if (actual !== expected) fail("mismatch", { label, actual, expected }); }
function truthy(label, actual) { if (actual !== true) fail("not-true", { label, actual }); }
function includes(label, list, value) { if (!Array.isArray(list) || !list.includes(value)) fail("missing-list-value", { label, value }); }

const candidateText = fs.readFileSync(candidatePath, "utf8");
const candidate = JSON.parse(candidateText);
const bindingRecord = read(bindingRecordPath);
const rowBinding = read(bindingRecord.rowBindingPath);
const metadata = read(bindingRecord.rawSourceMetadataPath);
const rawHtml = fs.readFileSync(bindingRecord.rawSourcePath, "utf8");
const governance = read(governancePath);
const classification = read(classificationPath);
const candidateRows = rows(candidate);
const sourceText = sourceTextFromHtml(rawHtml);

eq("candidate status", candidate.status, finalStatus);
eq("binding record status", bindingRecord.status, finalStatus);
eq("chapter count", candidate.chapters.length, 42);
eq("candidate row count", candidateRows.length, 522);
eq("binding row count", rowBinding.rowCount, candidateRows.length);
eq("binding rows length", rowBinding.rows.length, candidateRows.length);
eq("source sha", rowBinding.sourceSnapshotSha256, sha(rawHtml));
eq("metadata source sha", metadata.diagnostic?.sourceSnapshotSha256, sha(rawHtml));
eq("candidate file sha", bindingRecord.collation?.candidateFileSha256, sha(candidateText));
truthy("text trust promotion", bindingRecord.trustBoundary?.textTrustPromotion);
truthy("app render promotion", bindingRecord.trustBoundary?.appRenderPromotion);
truthy("row collation complete", bindingRecord.trustBoundary?.rowLevelCollationComplete);
truthy("source binding backed", bindingRecord.trustBoundary?.sourceBindingBacked);

let cursor = 0;
for (let i = 0; i < candidateRows.length; i++) {
  const row = candidateRows[i];
  const bound = rowBinding.rows[i];
  if (!bound) {
    fail("missing-binding-row", { index: i + 1, ref: row.ref });
    continue;
  }
  eq("binding ref " + (i + 1), bound.ref, row.ref);
  eq("binding text sha " + row.ref, bound.candidateTextSha256, sha(row.text));
  const found = sourceText.indexOf(norm(row.text), cursor);
  if (found < 0) fail("row-not-found-in-source-sequence", { ref: row.ref });
  else {
    eq("source offset " + row.ref, bound.normalizedSourceOffset, found);
    cursor = found + norm(row.text).length;
  }
}

eq("governance latest", governance.latestOdesOfSolomonSourceBinding?.recordPath, bindingRecordPath);
truthy("governance source binding", governance.latestOdesOfSolomonSourceBinding?.sourceBindingBacked);
truthy("governance text trust", governance.latestOdesOfSolomonSourceBinding?.textTrustPromotion);
truthy("governance app render", governance.latestOdesOfSolomonSourceBinding?.appRenderPromotion);
includes("allowedClaims", governance.allowedClaims, "broader_canon_odesofsolomon_source_binding_complete");
includes("allowedClaims", governance.allowedClaims, "broader_canon_odesofsolomon_text_trusted_source_binding_backed");
includes("allowedClaims", governance.allowedClaims, "broader_canon_odesofsolomon_app_render_eligible");

eq("classification latest", classification.odesOfSolomonSourceBinding?.recordPath, bindingRecordPath);
truthy("classification source binding", classification.odesOfSolomonSourceBinding?.sourceBindingBacked);
truthy("classification text trust", classification.odesOfSolomonSourceBinding?.textTrust);
truthy("classification app render", classification.odesOfSolomonSourceBinding?.appRenderPromotion);

console.log(JSON.stringify({
  audit: "broader-canon-odesofsolomon-source-binding",
  status: failures.length ? "failed" : "passed",
  candidatePath,
  bindingRecordPath,
  rowBindingPath: bindingRecord.rowBindingPath,
  chapterCount: candidate.chapters.length,
  rowCount: candidateRows.length,
  textTrust: candidate.status === finalStatus,
  appRenderEligible: candidate.status === finalStatus,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair Odes source binding.");
  process.exitCode = 1;
} else {
  console.log("ALL PASSED");
  console.log("NEXT: Odes source binding is complete.");
}
