import fs from "node:fs";

const failures = [];

const recordPath = "data/bible/registry/armenian-zohrab-nt-appendix-source-witness-2026-07-04.json";
const governancePath = "data/bible/registry/broader-canon-governance.json";
const classificationPath = "data/bible/registry/broader-canon-source-visible-classification-2026-07-04.json";

const record = JSON.parse(fs.readFileSync(recordPath, "utf8"));
const governance = JSON.parse(fs.readFileSync(governancePath, "utf8"));
const classification = JSON.parse(fs.readFileSync(classificationPath, "utf8"));

function requireEqual(label, actual, expected) {
  if (actual !== expected) failures.push({ type: "mismatch", label, actual, expected });
}

function requireIncludes(label, list, value) {
  if (!Array.isArray(list) || !list.includes(value)) {
    failures.push({ type: "missing-list-value", label, value });
  }
}

function requireItem(label, predicate) {
  if (!predicate) failures.push({ type: "missing-required-item", label });
}

requireEqual("record.status", record.status, "source_witness_located_pending_extraction_and_collation");
requireEqual("record.sourceWitness.archiveIdentifier", record.sourceWitness?.archiveIdentifier, "armenian-zohrab-bible-new-testament-1805");
requireEqual("record.governanceDecisions.bibleTextMutation", record.governanceDecisions?.bibleTextMutation, false);
requireEqual("record.governanceDecisions.candidateTextRepair", record.governanceDecisions?.candidateTextRepair, false);
requireEqual("record.governanceDecisions.textTrustPromoted", record.governanceDecisions?.textTrustPromoted, false);
requireEqual("record.governanceDecisions.appRenderPromoted", record.governanceDecisions?.appRenderPromoted, false);

requireItem("3 Corinthians pages 735-736", record.visualFindings?.some(item =>
  item.item === "3 Corinthians" &&
  JSON.stringify(item.pdfPages) === JSON.stringify([735, 736]) &&
  item.status === "source_witness_located_pending_extraction_and_collation"
));

requireItem("Repose of John pages 737-739", record.visualFindings?.some(item =>
  item.item === "Repose of John" &&
  JSON.stringify(item.pdfPages) === JSON.stringify([737, 738, 739]) &&
  item.status === "source_witness_located_pending_extraction_and_collation"
));

requireItem("Prayer of Euthalius page 740", record.visualFindings?.some(item =>
  item.item === "Prayer of Euthalius" &&
  JSON.stringify(item.pdfPages) === JSON.stringify([740]) &&
  item.status === "source_witness_located_pending_extraction_and_collation"
));

requireEqual("governance.recordPath", governance.armenianZohrabNtAppendixSourceWitness?.recordPath, recordPath);
requireEqual("governance.textMutation", governance.armenianZohrabNtAppendixSourceWitness?.textMutation, false);
requireEqual("governance.trustPromotion", governance.armenianZohrabNtAppendixSourceWitness?.trustPromotion, false);
requireEqual("governance.appRenderPromotion", governance.armenianZohrabNtAppendixSourceWitness?.appRenderPromotion, false);

requireIncludes("allowedClaims", governance.allowedClaims, "broader_canon_armenian_zohrab_nt_appendix_witness_located");
requireIncludes("allowedClaims", governance.allowedClaims, "broader_canon_armenian_3corinthians_zohrab_witness_located_pending_extraction");
requireIncludes("allowedClaims", governance.allowedClaims, "broader_canon_armenian_prayer_of_euthalius_zohrab_witness_located_pending_extraction");
requireIncludes("blockedClaims", governance.blockedClaims, "broader_canon_prayerofapollonius_identified_as_prayer_of_euthalius");
requireIncludes("blockedClaims", governance.blockedClaims, "broader_canon_armenian_zohrab_appendix_text_trusted_without_extraction");

requireEqual("classification.recordPath", classification.armenianZohrabNtAppendixSourceWitness?.recordPath, recordPath);
requireEqual("classification.textMutation", classification.armenianZohrabNtAppendixSourceWitness?.textMutation, false);
requireEqual("classification.trustPromotion", classification.armenianZohrabNtAppendixSourceWitness?.trustPromotion, false);

console.log(JSON.stringify({
  audit: "armenian-zohrab-nt-appendix-source-witness",
  status: failures.length ? "failed" : "passed",
  recordPath,
  bibleTextMutation: false,
  candidateTextRepair: false,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Repair Armenian Zohrab NT appendix source witness record.");
  process.exit(1);
}

console.log("ALL PASSED");
console.log("NEXT: Armenian Zohrab NT appendix source witness record passed QC.");
