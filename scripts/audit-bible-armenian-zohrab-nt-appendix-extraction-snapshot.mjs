import fs from "node:fs";

const failures = [];

const rawMetaPath = "data/bible/translations/armenian-zohrab-nt-appendix/raw/zohrab-nt-1805-appendix-source-metadata.json";
const rawPagesPath = "data/bible/translations/armenian-zohrab-nt-appendix/raw/zohrab-nt-1805-appendix-pages-735-740.json";
const snapshotPath = "data/bible/registry/armenian-zohrab-nt-appendix-extraction-snapshot-2026-07-04.json";
const witnessPath = "data/bible/registry/armenian-zohrab-nt-appendix-source-witness-2026-07-04.json";
const governancePath = "data/bible/registry/broader-canon-governance.json";
const classificationPath = "data/bible/registry/broader-canon-source-visible-classification-2026-07-04.json";

function read(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function requireEqual(label, actual, expected) {
  if (actual !== expected) failures.push({ type: "mismatch", label, actual, expected });
}

function requireTrue(label, value) {
  if (value !== true) failures.push({ type: "not-true", label, actual: value });
}

function requireFalse(label, value) {
  if (value !== false) failures.push({ type: "not-false", label, actual: value });
}

function requireIncludes(label, list, value) {
  if (!Array.isArray(list) || !list.includes(value)) {
    failures.push({ type: "missing-list-value", label, value });
  }
}

function requirePage(rawPages, pdfPage, item) {
  const found = rawPages.pages?.find(page => page.pdfPage === pdfPage && page.item === item);
  if (!found) {
    failures.push({ type: "missing-page", pdfPage, item });
    return;
  }
  if (!found.ocr || typeof found.ocr.text !== "string") {
    failures.push({ type: "missing-ocr-text", pdfPage, item });
  }
  if (!found.renderedVerification || !found.renderedVerification.sha256) {
    failures.push({ type: "missing-rendered-verification-sha", pdfPage, item });
  }
}

const rawMeta = read(rawMetaPath);
const rawPages = read(rawPagesPath);
const snapshot = read(snapshotPath);
const witness = read(witnessPath);
const governance = read(governancePath);
const classification = read(classificationPath);

requireEqual("rawMeta.status", rawMeta.status, "source_metadata_recorded_pending_manual_transcription_and_collation");
requireEqual("rawMeta.source.archiveIdentifier", rawMeta.source?.archiveIdentifier, "armenian-zohrab-bible-new-testament-1805");
requireEqual("rawMeta.source.pdfPageCountVerified", rawMeta.source?.pdfPageCountVerified, 744);
requireEqual("rawMeta.source.djvuXmlObjectCountVerified", rawMeta.source?.djvuXmlObjectCountVerified, 744);
requireTrue("rawMeta.trustBoundary.sourceWitnessLocated", rawMeta.trustBoundary?.sourceWitnessLocated);
requireFalse("rawMeta.trustBoundary.ocrTextTrusted", rawMeta.trustBoundary?.ocrTextTrusted);
requireFalse("rawMeta.trustBoundary.candidateBibleTextMutated", rawMeta.trustBoundary?.candidateBibleTextMutated);
requireFalse("rawMeta.trustBoundary.textTrustPromoted", rawMeta.trustBoundary?.textTrustPromoted);
requireFalse("rawMeta.trustBoundary.appRenderPromoted", rawMeta.trustBoundary?.appRenderPromoted);

requireEqual("rawPages.status", rawPages.status, "source_pages_extracted_pending_manual_transcription_and_collation");
requireEqual("rawPages.pages.length", rawPages.pages?.length, 6);
requirePage(rawPages, 735, "3 Corinthians");
requirePage(rawPages, 736, "3 Corinthians");
requirePage(rawPages, 737, "Repose of John");
requirePage(rawPages, 738, "Repose of John");
requirePage(rawPages, 739, "Repose of John");
requirePage(rawPages, 740, "Prayer of Euthalius");

requireEqual("snapshot.status", snapshot.status, "source_snapshot_created_pending_manual_transcription_and_collation");
requireEqual("snapshot.rawSourceMetadataPath", snapshot.rawSourceMetadataPath, rawMetaPath);
requireEqual("snapshot.rawPagesPath", snapshot.rawPagesPath, rawPagesPath);
requireTrue("snapshot.sourceTextBoundary.archiveDjvuOcrCaptured", snapshot.sourceTextBoundary?.archiveDjvuOcrCaptured);
requireFalse("snapshot.sourceTextBoundary.archiveDjvuOcrTrustedAsExactText", snapshot.sourceTextBoundary?.archiveDjvuOcrTrustedAsExactText);
requireTrue("snapshot.sourceTextBoundary.manualTranscriptionRequired", snapshot.sourceTextBoundary?.manualTranscriptionRequired);
requireFalse("snapshot.sourceTextBoundary.candidateTextMutation", snapshot.sourceTextBoundary?.candidateTextMutation);
requireFalse("snapshot.sourceTextBoundary.trustPromotion", snapshot.sourceTextBoundary?.trustPromotion);
requireFalse("snapshot.sourceTextBoundary.appRenderPromotion", snapshot.sourceTextBoundary?.appRenderPromotion);

requireEqual("witness.latestExtractionSnapshot.recordPath", witness.latestExtractionSnapshot?.recordPath, snapshotPath);
requireFalse("witness.latestExtractionSnapshot.candidateTextMutation", witness.latestExtractionSnapshot?.candidateTextMutation);
requireFalse("witness.latestExtractionSnapshot.trustPromotion", witness.latestExtractionSnapshot?.trustPromotion);
requireFalse("witness.latestExtractionSnapshot.appRenderPromotion", witness.latestExtractionSnapshot?.appRenderPromotion);

requireEqual("governance.latestExtractionSnapshot.recordPath", governance.armenianZohrabNtAppendixSourceWitness?.latestExtractionSnapshot?.recordPath, snapshotPath);
requireFalse("governance.textMutation", governance.armenianZohrabNtAppendixSourceWitness?.textMutation);
requireFalse("governance.trustPromotion", governance.armenianZohrabNtAppendixSourceWitness?.trustPromotion);
requireFalse("governance.appRenderPromotion", governance.armenianZohrabNtAppendixSourceWitness?.appRenderPromotion);

requireIncludes("allowedClaims", governance.allowedClaims, "broader_canon_armenian_zohrab_nt_appendix_source_snapshot_created");
requireIncludes("allowedClaims", governance.allowedClaims, "broader_canon_armenian_zohrab_nt_appendix_pages_735_740_ocr_captured_untrusted");
requireIncludes("blockedClaims", governance.blockedClaims, "broader_canon_armenian_zohrab_nt_appendix_trusted_from_ocr_alone");
requireIncludes("blockedClaims", governance.blockedClaims, "broader_canon_armenian_3corinthians_text_trusted_from_page_location_alone");

requireEqual("classification.snapshot.recordPath", classification.armenianZohrabNtAppendixExtractionSnapshot?.recordPath, snapshotPath);
requireFalse("classification.snapshot.textMutation", classification.armenianZohrabNtAppendixExtractionSnapshot?.textMutation);
requireFalse("classification.snapshot.trustPromotion", classification.armenianZohrabNtAppendixExtractionSnapshot?.trustPromotion);
requireFalse("classification.snapshot.appRenderPromotion", classification.armenianZohrabNtAppendixExtractionSnapshot?.appRenderPromotion);

console.log(JSON.stringify({
  audit: "armenian-zohrab-nt-appendix-extraction-snapshot",
  status: failures.length ? "failed" : "passed",
  rawMetaPath,
  rawPagesPath,
  snapshotPath,
  candidateTextMutation: false,
  trustPromotion: false,
  appRenderPromotion: false,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair Armenian Zohrab appendix extraction snapshot.");
  process.exit(1);
}

console.log("ALL PASSED");
console.log("NEXT: Armenian Zohrab appendix extraction snapshot passed QC.");
