import fs from "node:fs";
import path from "node:path";

const failures = [];
const warnings = [];

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (error) {
    fail(`${filePath} is missing or invalid JSON: ${error.message}`);
    return null;
  }
}

const policy = readJson("data/commentary/patristic-witness-author-policy.json");
const manifest = readJson(".external/generated/patristic-witness/manifest.json");
const inventory = readJson(".external/generated/patristic-witness/author-inventory.json");
const reviewQueue = readJson(".external/generated/patristic-witness/review-queue.json");
const summary = readJson("documentation/patristic-witness-intake-summary.json");

if (policy?.schema !== "universal_office_patristic_witness_author_policy_v1") {
  fail("author policy schema mismatch.");
}

if (manifest?.schema !== "universal_office_patristic_witness_manifest_v1") {
  fail("manifest schema mismatch.");
}

if (inventory?.schema !== "universal_office_patristic_witness_author_inventory_v1") {
  fail("author inventory schema mismatch.");
}

if (reviewQueue?.schema !== "universal_office_patristic_witness_review_queue_v1") {
  fail("review queue schema mismatch.");
}

if (summary?.schema !== "universal_office_patristic_witness_intake_summary_v1") {
  fail("tracked source-intake summary schema mismatch.");
}

if (summary?.runtimeStatus !== "source-intake-only; not yet shipped in web-release") {
  fail("tracked source-intake summary does not mark runtime status correctly.");
}

if (manifest && manifest.sourceRepository !== "HistoricalChristianFaith/Commentaries-Database") {
  fail("manifest source repository mismatch.");
}

if (!manifest?.stats?.includedEntries || manifest.stats.includedEntries < 1) {
  fail("patristic witness index has no included entries.");
}

if (!manifest?.stats?.excludedEntries || manifest.stats.excludedEntries < 1) {
  fail("patristic witness index has no excluded entries; Protestant/post-Reformation filter may not be working.");
}

if (!manifest?.stats?.bookShardCount || manifest.stats.bookShardCount < 1) {
  fail("patristic witness index has no book shards.");
}

if (!manifest?.books?.some(book => book.book === "hebrews")) {
  fail("patristic witness index does not include a Hebrews shard for Bible Browser smoke testing.");
}

if (!manifest?.licenseNotice?.summary?.includes("fair-use")) {
  fail("manifest does not preserve mixed public-domain/fair-use source notice.");
}

const protestantKeywords = (policy?.protestantAuthorNameKeywords || []).map(keyword => String(keyword).toLowerCase());
const maxYear = Number(policy?.filterPolicy?.defaultIncludeMaxYearInclusive || 1517);
let scannedEntries = 0;
let generatedBytes = 0;
const protestantHits = [];
const postReformationHits = [];
const missingSourceTitles = [];
const missingQuotes = [];

for (const book of manifest?.books || []) {
  const shardPath = book.path;
  const shard = readJson(shardPath);
  if (!shard) continue;

  const actualBytes = fs.statSync(shardPath).size;
  generatedBytes += actualBytes;

  if (actualBytes !== book.bytes) {
    fail(`${shardPath} byte count does not match manifest.`);
  }

  if (shard.schema !== "universal_office_patristic_witness_book_shard_v1") {
    fail(`${shardPath} schema mismatch.`);
  }

  for (const entry of shard.entries || []) {
    scannedEntries += 1;

    const author = String(entry.fatherName || "").toLowerCase();
    const matchingKeyword = protestantKeywords.find(keyword => keyword && author.includes(keyword));
    if (matchingKeyword) {
      protestantHits.push(`${entry.fatherName} matched ${matchingKeyword} in ${shardPath}`);
    }

    if (Number.isFinite(Number(entry.time)) && Number(entry.time) > maxYear) {
      postReformationHits.push(`${entry.fatherName} has time ${entry.time} in ${shardPath}`);
    }

    if (!entry.sourceTitle) {
      missingSourceTitles.push(`${entry.id} ${entry.fatherName} ${entry.range?.label || ""}`);
    }

    if (!entry.quote || String(entry.quote).trim().length < 8) {
      missingQuotes.push(`${entry.id} has missing/short quote`);
    }

    if (!entry.range?.locationStart || !entry.range?.locationEnd) {
      fail(`${entry.id} is missing encoded range fields.`);
    }

    if (entry.range?.locationStart > entry.range?.locationEnd) {
      fail(`${entry.id} has inverted location range.`);
    }
  }
}

if (scannedEntries !== manifest?.stats?.includedEntries) {
  fail(`included entry count mismatch: manifest=${manifest?.stats?.includedEntries} scanned=${scannedEntries}`);
}

if (protestantHits.length) {
  fail(`Protestant-keyword authors leaked into included index: ${protestantHits.slice(0, 5).join("; ")}`);
}

if (postReformationHits.length) {
  fail(`Post-1517 entries leaked into included index: ${postReformationHits.slice(0, 5).join("; ")}`);
}

if (missingQuotes.length) {
  fail(`Entries with missing/short quotes found: ${missingQuotes.slice(0, 5).join("; ")}`);
}

if (missingSourceTitles.length) {
  warn(`${missingSourceTitles.length} included entries have no source title; preserve in review queue later if this becomes common.`);
}

if (manifest?.stats?.generatedBytes > 30_000_000) {
  warn(`Generated patristic witness index is large: ${manifest.stats.generatedBytes} bytes.`);
}

if (!Array.isArray(reviewQueue?.authors)) {
  fail("review queue authors list missing.");
}

if (failures.length) {
  console.error("FAIL patristic witness audit");
  for (const item of failures) console.error(" - " + item);
  if (warnings.length) {
    console.error("WARNINGS");
    for (const item of warnings) console.error(" - " + item);
  }
  process.exit(1);
}

for (const item of warnings) {
  console.warn("WARN " + item);
}

console.log(
  `PASS patristic witness audit: books=${manifest.stats.bookShardCount} ` +
  `included=${manifest.stats.includedEntries} excluded=${manifest.stats.excludedEntries} ` +
  `review=${manifest.stats.reviewEntries} bytes=${manifest.stats.generatedBytes}`
);
