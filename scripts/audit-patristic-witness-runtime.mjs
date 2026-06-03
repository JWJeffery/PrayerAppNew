import fs from "node:fs";

const failures = [];
const warnings = [];

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, "utf-8"));
  } catch (error) {
    fail(`${path} is missing or invalid JSON: ${error.message}`);
    return null;
  }
}

const manifest = readJson("data/commentary/patristic-witness-runtime/manifest.json");
const guide = fs.existsSync("js/bible-browser/passage-guide.js")
  ? fs.readFileSync("js/bible-browser/passage-guide.js", "utf-8")
  : "";

if (manifest?.schema !== "universal_office_patristic_witness_runtime_manifest_v1") {
  fail("runtime manifest schema mismatch.");
}

if (!manifest?.books?.some(book => book.book === "hebrews")) {
  fail("runtime manifest does not include Hebrews.");
}

if (!manifest?.licenseNotice?.summary?.includes("fair-use")) {
  fail("runtime manifest does not preserve source license/fair-use notice.");
}

if (!manifest?.runtimePolicy?.reason?.includes("Do not ship the full")) {
  fail("runtime manifest does not document why this is a compact slice.");
}

let scanned = 0;
let bytes = 0;
const postReformation = [];
const inverted = [];
const protestantKeywordHits = [];

const protestantKeywords = [
  "calvin",
  "luther",
  "matthew henry",
  "john gill",
  "wesley",
  "spurgeon",
  "darby",
];

for (const book of manifest?.books || []) {
  const shard = readJson(book.path);
  if (!shard) continue;

  const actualBytes = fs.statSync(book.path).size;
  bytes += actualBytes;

  if (actualBytes !== book.bytes) {
    fail(`${book.path} byte count does not match runtime manifest.`);
  }

  if (shard.schema !== "universal_office_patristic_witness_runtime_book_v1") {
    fail(`${book.path} schema mismatch.`);
  }

  if (!Array.isArray(shard.entries) || shard.entries.length < 1) {
    fail(`${book.path} has no entries.`);
  }

  for (const entry of shard.entries || []) {
    scanned += 1;
    if (!entry.quote || String(entry.quote).trim().length < 8) {
      fail(`${entry.id} has missing/short quote.`);
    }
    if (!entry.range?.locationStart || !entry.range?.locationEnd) {
      fail(`${entry.id} is missing encoded range fields.`);
    }
    if (entry.range?.locationStart > entry.range?.locationEnd) {
      inverted.push(entry.id);
    }
    if (Number.isFinite(Number(entry.time)) && Number(entry.time) > 1517) {
      postReformation.push(`${entry.fatherName} ${entry.time}`);
    }
    const lowered = String(entry.fatherName || "").toLowerCase();
    const keyword = protestantKeywords.find(item => lowered.includes(item));
    if (keyword) {
      protestantKeywordHits.push(`${entry.fatherName} matched ${keyword}`);
    }
  }
}

if (scanned !== manifest?.stats?.runtimeEntryCount) {
  fail(`runtime entry count mismatch: manifest=${manifest?.stats?.runtimeEntryCount} scanned=${scanned}`);
}

if (inverted.length) {
  fail(`runtime has inverted ranges: ${inverted.slice(0, 5).join(", ")}`);
}

if (postReformation.length) {
  fail(`runtime has post-1517 entries: ${postReformation.slice(0, 5).join("; ")}`);
}

if (protestantKeywordHits.length) {
  fail(`runtime has Protestant-keyword author hits: ${protestantKeywordHits.slice(0, 5).join("; ")}`);
}

if (manifest?.stats?.runtimeBytes > 15_000_000) {
  warn(`runtime patristic witness slice is large: ${manifest.stats.runtimeBytes} bytes.`);
}

if (!guide.includes("UniversalOfficePassageGuide")) {
  fail("Passage Guide script does not expose UniversalOfficePassageGuide.");
}

if (!guide.includes("queryFathersForRanges")) {
  fail("Passage Guide script does not include Fathers range query function.");
}

if (!guide.includes("loadFathersForRanges")) {
  fail("Passage Guide script does not expose direct selected-range Fathers loading.");
}

if (!guide.includes("locationStart <= range.endLocation")) {
  fail("Passage Guide script does not use overlap matching against selected range.");
}

if (failures.length) {
  console.error("FAIL patristic witness runtime audit");
  for (const item of failures) console.error(" - " + item);
  if (warnings.length) {
    console.error("WARNINGS");
    for (const item of warnings) console.error(" - " + item);
  }
  process.exit(1);
}

for (const item of warnings) console.warn("WARN " + item);
console.log(`PASS patristic witness runtime audit: books=${manifest.stats.runtimeBookCount} entries=${manifest.stats.runtimeEntryCount} bytes=${manifest.stats.runtimeBytes}`);
