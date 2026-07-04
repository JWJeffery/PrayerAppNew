#!/usr/bin/env node
import fs from "node:fs";

const candidatePath = "data/bible/NT/epistleofthelaodiceans.json";
const rawSourcePath = "data/bible/translations/laodiceans-gutenberg-lost-books/raw/epistle-to-laodiceans.json";
const governancePath = "data/bible/registry/broader-canon-governance.json";
const statusPath = "data/bible/registry/bible-corpus-trust-status.json";
const classificationPath = "data/bible/registry/broader-canon-source-visible-classification-2026-07-04.json";
const recordPath = "data/bible/registry/broader-canon-source-binding-collation-laodiceans-2026-07-04.json";

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

const failures = [];
const candidate = readJson(candidatePath);
const rawSource = readJson(rawSourcePath);
const governance = readJson(governancePath);
const status = readJson(statusPath);
const classification = readJson(classificationPath);
const record = readJson(recordPath);
const lane = status.lanes?.broader_canon;

const rows = (candidate.chapters || []).flatMap(chapter => (chapter.verses || []).map(verse => ({
  chapter: Number(chapter.num),
  verse: Number(verse.num),
  ref: `${chapter.num}:${verse.num}`,
  text: verse.text
})));
const sourceRows = rawSource.normalizedRows || [];
const expectedVerseNumbers = [1,2,3,4,5,6,8,9,10,11,12,13,14,15,16,17,18,19];

if (candidate.meta?.version !== "The Lost Books of the Bible / Project Gutenberg English Witness") failures.push({ type: "candidate-version-mismatch", actual: candidate.meta?.version });
if (JSON.stringify(rows.map(row => row.verse)) !== JSON.stringify(expectedVerseNumbers)) failures.push({ type: "candidate-visible-verse-sequence-mismatch", actual: rows.map(row => row.verse) });
if (JSON.stringify(rawSource.visibleVerseNumbers || []) !== JSON.stringify(expectedVerseNumbers)) failures.push({ type: "raw-visible-verse-sequence-mismatch", actual: rawSource.visibleVerseNumbers || null });
if (rows.some(row => row.verse === 7)) failures.push({ type: "synthetic-verse-7-present" });
if (rows.length !== 18) failures.push({ type: "candidate-row-count-mismatch", actual: rows.length });
if (sourceRows.length !== 18) failures.push({ type: "source-row-count-mismatch", actual: sourceRows.length });

for (let i = 0; i < Math.max(rows.length, sourceRows.length); i++) {
  const row = rows[i];
  const source = sourceRows[i];
  if (!row || !source || row.ref !== source.ref || row.text !== source.text) {
    failures.push({ type: "candidate-source-row-mismatch", index: i, candidate: row || null, source: source || null });
  }
}

if (!String(rows[0]?.text || "").startsWith("PAUL an Apostle")) failures.push({ type: "first-anchor-mismatch", actual: rows[0]?.text || null });
if (!String(rows[17]?.text || "").startsWith("Cause this Epistle")) failures.push({ type: "last-anchor-mismatch", actual: rows[17]?.text || null });
if (/REFERENCES|SENECA|CHAPTER I/i.test(rows[17]?.text || "")) failures.push({ type: "last-row-leaked-past-laodiceans", actual: rows[17]?.text || null });

if (record.schema !== "broader-canon-source-binding-collation-laodiceans-v4") failures.push({ type: "record-schema-mismatch", actual: record.schema });
if (record.status !== "passed_exact_visible_gutenberg_source_repair_candidate_mutated") failures.push({ type: "record-status-mismatch", actual: record.status });
if (record.scope?.candidatePath !== candidatePath) failures.push({ type: "candidate-path-mismatch", actual: record.scope?.candidatePath });
if (record.scope?.rawSourcePath !== rawSourcePath) failures.push({ type: "raw-source-path-mismatch", actual: record.scope?.rawSourcePath });
if (record.scope?.bibleVerseTextMutation !== true) failures.push({ type: "expected-bible-verse-text-mutation-not-recorded" });
if (record.scope?.candidateJsonMutation !== true) failures.push({ type: "expected-candidate-json-mutation-not-recorded" });
if (record.scope?.metadataMutation !== true) failures.push({ type: "expected-metadata-mutation-not-recorded" });
if (record.scope?.syntheticVerse7Created !== false) failures.push({ type: "synthetic-verse-7-flag-mismatch", actual: record.scope?.syntheticVerse7Created });
if (record.repairSummary?.exactRawSourceMismatchCount !== 0) failures.push({ type: "record-mismatch-count-not-zero", actual: record.repairSummary?.exactRawSourceMismatchCount });
if ((record.repairSummary?.manualVariantExceptionRefsAfterRepair || []).length !== 0) failures.push({ type: "manual-exceptions-not-cleared", actual: record.repairSummary?.manualVariantExceptionRefsAfterRepair });

if (governance.sourceBindingCollationLaodiceans?.recordPath !== recordPath) failures.push({ type: "governance-pointer-mismatch", actual: governance.sourceBindingCollationLaodiceans?.recordPath || null });
if (governance.sourceBindingCollationLaodiceans?.exactRawSourceMismatchCount !== 0) failures.push({ type: "governance-mismatch-count-not-zero", actual: governance.sourceBindingCollationLaodiceans?.exactRawSourceMismatchCount });
if (governance.sourceBindingCollationLaodiceans?.syntheticVerse7Created !== false) failures.push({ type: "governance-synthetic-verse-7-flag-mismatch", actual: governance.sourceBindingCollationLaodiceans?.syntheticVerse7Created });

for (const staleClaim of ["broader_canon_laodiceans_exact_text_source_collation", "broader_canon_laodiceans_textually_trusted", "broader_canon_laodiceans_app_render_eligible"]) {
  if (Array.isArray(governance.blockedClaims) && governance.blockedClaims.includes(staleClaim)) failures.push({ type: "stale-governance-blocked-claim-remains", claim: staleClaim });
  if (Array.isArray(lane?.blockedClaims) && lane.blockedClaims.includes(staleClaim)) failures.push({ type: "stale-lane-blocked-claim-remains", claim: staleClaim });
}

if (lane?.status !== "not_trusted_textually_broader_canon_candidates_quarantined_app_safe") failures.push({ type: "lane-status-mismatch", actual: lane?.status || null });
if (lane?.appUseTrustReady !== true) failures.push({ type: "lane-app-use-trust-ready-mismatch", actual: lane?.appUseTrustReady });
if (lane?.textTrustReady !== false) failures.push({ type: "lane-text-trust-ready-mismatch", actual: lane?.textTrustReady });
if (lane?.latest_broader_canon_source_binding_collation_laodiceans?.recordPath !== recordPath) failures.push({ type: "lane-pointer-mismatch", actual: lane?.latest_broader_canon_source_binding_collation_laodiceans?.recordPath || null });

const classificationItem = (classification.items || []).find(item => item.path === candidatePath);
if (!classificationItem) failures.push({ type: "classification-item-missing" });
if (classificationItem && !String(classificationItem.metadataSourceStatement || "").includes("Project Gutenberg")) failures.push({ type: "classification-source-statement-not-updated", actual: classificationItem.metadataSourceStatement || null });

for (const claim of record.allowedClaims || []) {
  if (!Array.isArray(governance.allowedClaims) || !governance.allowedClaims.includes(claim)) failures.push({ type: "missing-governance-allowed-claim", claim });
  if (!Array.isArray(lane?.allowedClaims) || !lane.allowedClaims.includes(claim)) failures.push({ type: "missing-lane-allowed-claim", claim });
}

for (const claim of record.blockedClaims || []) {
  if (!Array.isArray(governance.blockedClaims) || !governance.blockedClaims.includes(claim)) failures.push({ type: "missing-governance-blocked-claim", claim });
  if (!Array.isArray(lane?.blockedClaims) || !lane.blockedClaims.includes(claim)) failures.push({ type: "missing-lane-blocked-claim", claim });
}

console.log(JSON.stringify({
  audit: "broader-canon-source-binding-collation-laodiceans",
  status: failures.length ? "failed" : "passed",
  candidateRowCount: rows.length,
  sourceRowCount: sourceRows.length,
  visibleVerseNumbers: rows.map(row => row.verse),
  exactRawSourceMismatchCount: failures.filter(failure => failure.type === "candidate-source-row-mismatch").length,
  candidateVersion: candidate.meta?.version || null,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair Laodiceans visible Gutenberg source repair.");
} else {
  console.log("ALL PASSED");
  console.log("NEXT: Laodiceans now matches the visible selected Gutenberg/Lost Books witness; proceed to 3 Corinthians source-basis inspection.");
}

process.exit(failures.length ? 1 : 0);
