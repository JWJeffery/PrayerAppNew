#!/usr/bin/env node
import fs from "node:fs";
import crypto from "node:crypto";

const candidatePath = "data/bible/AR/3corinthiansAR.json";
const governancePath = "data/bible/registry/broader-canon-governance.json";
const statusPath = "data/bible/registry/bible-corpus-trust-status.json";
const classificationPath = "data/bible/registry/broader-canon-source-visible-classification-2026-07-04.json";
const recordPath = "data/bible/registry/broader-canon-source-identity-blocker-3corinthians-2026-07-04.json";

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function sha256(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function verseTextPayload(candidate) {
  return JSON.stringify((candidate.chapters || []).map(chapter => ({
    num: chapter.num,
    verses: (chapter.verses || []).map(verse => ({
      num: verse.num,
      text: verse.text
    }))
  })));
}

const failures = [];
const candidate = readJson(candidatePath);
const governance = readJson(governancePath);
const status = readJson(statusPath);
const classification = readJson(classificationPath);
const record = readJson(recordPath);
const lane = status.lanes?.broader_canon;

const rowCount = (candidate.chapters || []).reduce((sum, chapter) => sum + (chapter.verses || []).length, 0);
const currentVerseHash = sha256(verseTextPayload(candidate));

if (record.schema !== "broader-canon-source-identity-blocker-3corinthians-v1") failures.push({ type: "record-schema-mismatch", actual: record.schema });
if (record.status !== "blocked_modern_hovhanessian_source_identity_no_bible_text_mutation") failures.push({ type: "record-status-mismatch", actual: record.status });
if (record.scope?.candidatePath !== candidatePath) failures.push({ type: "candidate-path-mismatch", actual: record.scope?.candidatePath });
if (record.scope?.bibleVerseTextMutation !== false) failures.push({ type: "unexpected-bible-verse-text-mutation" });
if (record.scope?.candidateJsonMutation !== true) failures.push({ type: "candidate-json-mutation-not-recorded" });
if (record.scope?.metadataMutation !== true) failures.push({ type: "metadata-mutation-not-recorded" });
if (record.scope?.broaderCanonTextTrustPromotion !== false) failures.push({ type: "unexpected-text-trust-promotion" });
if (record.scope?.broaderCanonAppRenderPromotion !== false) failures.push({ type: "unexpected-app-render-promotion" });

if (candidate.meta?.version !== "Source identity blocked: Hovhanessian claim unverified") failures.push({ type: "candidate-version-not-blocked", actual: candidate.meta?.version });
if (!String(candidate.meta?.copyright || "").includes("Not public-domain verified")) failures.push({ type: "candidate-copyright-not-blocked", actual: candidate.meta?.copyright });
if (rowCount !== 19) failures.push({ type: "candidate-row-count-mismatch", actual: rowCount });

if (record.candidateSnapshot?.verseTextSha256Before !== record.candidateSnapshot?.verseTextSha256After) failures.push({ type: "record-verse-hash-changed" });
if (record.candidateSnapshot?.verseTextSha256After !== currentVerseHash) failures.push({ type: "current-verse-hash-mismatch", expected: record.candidateSnapshot?.verseTextSha256After, actual: currentVerseHash });

if (record.identityFindings?.hovhanessianBibliographicLead?.date !== "2000") failures.push({ type: "hovhanessian-date-mismatch", actual: record.identityFindings?.hovhanessianBibliographicLead?.date });
if (!String(record.identityFindings?.hovhanessianBibliographicLead?.publisher || "").includes("Peter Lang")) failures.push({ type: "hovhanessian-publisher-mismatch", actual: record.identityFindings?.hovhanessianBibliographicLead?.publisher });
if (record.identityFindings?.interfaithLead?.status !== "rejected_as_repair_source") failures.push({ type: "interfaith-rejection-not-recorded" });
if (record.identityFindings?.interfaithLead?.directAnchorMatchCount !== 0) failures.push({ type: "interfaith-direct-anchor-count-mismatch", actual: record.identityFindings?.interfaithLead?.directAnchorMatchCount });

const classificationItem = (classification.items || []).find(item => item.path === candidatePath);
if (!classificationItem) failures.push({ type: "classification-item-missing" });
if (classificationItem && classificationItem.sourceVisibility !== "metadata_specific_source_identity_blocked") failures.push({ type: "classification-source-visibility-mismatch", actual: classificationItem.sourceVisibility });
if (classificationItem && classificationItem.currentDisposition !== "blocked_modern_source_identity_no_bible_text_mutation") failures.push({ type: "classification-disposition-mismatch", actual: classificationItem.currentDisposition });

if (governance.sourceIdentityBlocker3Corinthians?.recordPath !== recordPath) failures.push({ type: "governance-pointer-mismatch", actual: governance.sourceIdentityBlocker3Corinthians?.recordPath || null });
if (governance.sourceIdentityBlocker3Corinthians?.bibleVerseTextMutation !== false) failures.push({ type: "governance-bible-text-mutation-mismatch", actual: governance.sourceIdentityBlocker3Corinthians?.bibleVerseTextMutation });
if (governance.sourceIdentityBlocker3Corinthians?.interfaithRepairRejected !== true) failures.push({ type: "governance-interfaith-rejection-missing" });

if (lane?.status !== "not_trusted_textually_broader_canon_candidates_quarantined_app_safe") failures.push({ type: "lane-status-mismatch", actual: lane?.status || null });
if (lane?.appUseTrustReady !== true) failures.push({ type: "lane-app-use-trust-ready-mismatch", actual: lane?.appUseTrustReady });
if (lane?.textTrustReady !== false) failures.push({ type: "lane-text-trust-ready-mismatch", actual: lane?.textTrustReady });
if (lane?.latest_broader_canon_source_identity_blocker_3corinthians?.recordPath !== recordPath) failures.push({ type: "lane-pointer-mismatch", actual: lane?.latest_broader_canon_source_identity_blocker_3corinthians?.recordPath || null });

for (const claim of record.allowedClaims || []) {
  if (!Array.isArray(governance.allowedClaims) || !governance.allowedClaims.includes(claim)) failures.push({ type: "missing-governance-allowed-claim", claim });
  if (!Array.isArray(lane?.allowedClaims) || !lane.allowedClaims.includes(claim)) failures.push({ type: "missing-lane-allowed-claim", claim });
}

for (const claim of record.blockedClaims || []) {
  if (!Array.isArray(governance.blockedClaims) || !governance.blockedClaims.includes(claim)) failures.push({ type: "missing-governance-blocked-claim", claim });
  if (!Array.isArray(lane?.blockedClaims) || !lane.blockedClaims.includes(claim)) failures.push({ type: "missing-lane-blocked-claim", claim });
}

console.log(JSON.stringify({
  audit: "broader-canon-source-identity-blocker-3corinthians",
  status: failures.length ? "failed" : "passed",
  candidateRowCount: rowCount,
  candidateVersion: candidate.meta?.version || null,
  bibleVerseTextMutation: false,
  blockerType: governance.sourceIdentityBlocker3Corinthians?.blockerType || null,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair 3 Corinthians source identity blocker.");
} else {
  console.log("ALL PASSED");
  console.log("NEXT: 3 Corinthians source identity is blocked without Bible text mutation; proceed to the next broader-canon source-visible candidate or source acquisition.");
}

process.exit(failures.length ? 1 : 0);
