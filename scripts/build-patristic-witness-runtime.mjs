import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceDir = path.join(root, ".external", "generated", "patristic-witness");
const sourceManifestPath = path.join(sourceDir, "manifest.json");
const runtimeDir = path.join(root, "data", "commentary", "patristic-witness-runtime");
const runtimeBooksDir = path.join(runtimeDir, "books");

const runtimeBooks = ["hebrews"];

function fail(message) {
  console.error("FAIL patristic witness runtime build");
  console.error(" - " + message);
  process.exit(1);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (error) {
    fail(`${filePath} is missing or invalid JSON: ${error.message}`);
  }
}

if (!fs.existsSync(sourceManifestPath)) {
  fail("source-intake manifest is missing. Run npm run commentary:patristic:build first.");
}

const sourceManifest = readJson(sourceManifestPath);

fs.rmSync(runtimeDir, { recursive: true, force: true });
fs.mkdirSync(runtimeBooksDir, { recursive: true });

const runtimeBookRecords = [];
let totalEntries = 0;
let totalBytes = 0;

for (const bookKey of runtimeBooks) {
  const sourceBook = sourceManifest.books.find(book => book.book === bookKey);
  if (!sourceBook) {
    fail(`source-intake manifest has no ${bookKey} shard.`);
  }

  const sourceShard = readJson(path.join(root, sourceBook.path));
  const compactEntries = (sourceShard.entries || []).map(entry => ({
    id: entry.id,
    fatherName: entry.fatherName,
    authorDisplay: entry.authorDisplay,
    classification: entry.classification,
    time: entry.time,
    book: entry.book,
    bookName: entry.bookName,
    range: entry.range,
    quote: entry.quote,
    sourceTitle: entry.sourceTitle,
    sourceUrl: entry.sourceUrl,
    sourceFile: entry.sourceFile,
  }));

  compactEntries.sort((a, b) => {
    const loc = Number(a.range.locationStart) - Number(b.range.locationStart);
    if (loc) return loc;
    const time = Number(a.time || 9999999) - Number(b.time || 9999999);
    if (time) return time;
    return String(a.fatherName).localeCompare(String(b.fatherName));
  });

  const runtimeShard = {
    schema: "universal_office_patristic_witness_runtime_book_v1",
    book: bookKey,
    bookName: sourceShard.bookName,
    sourceRepository: sourceManifest.sourceRepository,
    sourceBranch: sourceManifest.sourceBranch,
    sourceCommit: sourceManifest.sourceCommit,
    filterPolicy: sourceManifest.filterPolicy,
    runtimePolicy: {
      description: "Compact browser runtime slice for Passage Guide Fathers module.",
      sourceIntakeOutput: ".external/generated/patristic-witness",
      runtimeScope: "initial proof slice; expand book set intentionally",
    },
    entryCount: compactEntries.length,
    entries: compactEntries,
  };

  const runtimePath = path.join(runtimeBooksDir, `${bookKey}.json`);
  fs.writeFileSync(runtimePath, JSON.stringify(runtimeShard, null, 2) + "\n", "utf-8");
  const bytes = fs.statSync(runtimePath).size;

  runtimeBookRecords.push({
    book: bookKey,
    bookName: runtimeShard.bookName,
    path: path.relative(root, runtimePath),
    entryCount: compactEntries.length,
    bytes,
  });
  totalEntries += compactEntries.length;
  totalBytes += bytes;
}

const manifest = {
  schema: "universal_office_patristic_witness_runtime_manifest_v1",
  sourceRepository: sourceManifest.sourceRepository,
  sourceBranch: sourceManifest.sourceBranch,
  sourceCommit: sourceManifest.sourceCommit,
  sourceIntakeSummary: "documentation/patristic-witness-intake-summary.json",
  sourceIntakeOutput: ".external/generated/patristic-witness",
  licenseNotice: sourceManifest.licenseNotice,
  runtimePolicy: {
    status: "initial browser runtime slice",
    includedBooks: runtimeBooks,
    fullSourceEntriesAvailableLocally: sourceManifest.stats.includedEntries,
    reason: "Do not ship the full 170MB+ patristic source-intake output into web-release until paging/indexing is designed.",
  },
  stats: {
    runtimeBookCount: runtimeBookRecords.length,
    runtimeEntryCount: totalEntries,
    runtimeBytes: totalBytes,
  },
  books: runtimeBookRecords,
};

const manifestPath = path.join(runtimeDir, "manifest.json");
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf-8");
totalBytes += fs.statSync(manifestPath).size;
manifest.stats.runtimeBytes = totalBytes;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf-8");

console.log(
  `PASS patristic witness runtime build: books=${manifest.stats.runtimeBookCount} ` +
  `entries=${manifest.stats.runtimeEntryCount} bytes=${manifest.stats.runtimeBytes}`
);
