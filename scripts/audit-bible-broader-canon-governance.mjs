#!/usr/bin/env node
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const governancePath = "data/bible/registry/broader-canon-governance.json";
const statusPath = "data/bible/registry/bible-corpus-trust-status.json";
const adjudicationPath = "data/bible/registry/broader-canon-source-provenance-adjudication-2026-07-03.json";

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function git(args) {
  return spawnSync("git", args, { encoding: "utf8", maxBuffer: 1024 * 1024 * 30 });
}

function chaptersOf(data) {
  if (Array.isArray(data?.chapters)) return data.chapters;
  if (data?.chapters && typeof data.chapters === "object") return Object.values(data.chapters);
  return [];
}

function versesOf(chapter) {
  if (Array.isArray(chapter?.verses)) return chapter.verses;
  if (chapter?.verses && typeof chapter.verses === "object") return Object.values(chapter.verses);
  return [];
}

function sourceLikeKeys(obj, prefix = "") {
  const found = [];
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return found;
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (/source|provenance|witness|url|license|copyright|translation|version|edition|language|canon|tradition|origin/i.test(key)) found.push(path);
    if (value && typeof value === "object" && !Array.isArray(value)) found.push(...sourceLikeKeys(value, path));
  }
  return found;
}

function hasConcreteSourcePointer(obj) {
  return sourceLikeKeys(obj).some((key) => /source|provenance|witness|url|edition|license/i.test(key));
}

function broaderCandidates() {
  const canonicalOt = new Set("genesis exodus leviticus numbers deuteronomy joshua judges ruth 1samuel 2samuel 1kings 2kings 1chronicles 2chronicles ezra nehemiah esther job psalms proverbs ecclesiastes songofsolomon isaiah jeremiah lamentations ezekiel daniel hosea joel amos obadiah jonah micah nahum habakkuk zephaniah haggai zechariah malachi".split(" "));
  const nt = new Set("matthew mark luke john acts romans 1corinthians 2corinthians galatians ephesians philippians colossians 1thessalonians 2thessalonians 1timothy 2timothy titus philemon hebrews james 1peter 2peter 1john 2john 3john jude revelation".split(" "));
  const deuterocanonGoverned = new Set("tobit judith wisdom sirach baruch letterofjeremiah 1maccabees 2maccabees 3maccabees 4maccabees danielGK estherGK prayerofmanasseh 1esdras 2esdras".split(" "));

  return git(["ls-files", "data/bible"]).stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((path) => path.endsWith(".json"))
    .filter((path) => !path.includes("/translations/"))
    .filter((path) => !path.includes("/registry/"))
    .filter((path) => {
      const parts = path.split("/");
      const file = parts[parts.length - 1].replace(/\.json$/, "");
      const bucket = parts[2] || "";
      return !(bucket === "OT" && canonicalOt.has(file)) &&
        !(bucket === "NT" && nt.has(file)) &&
        !(bucket === "OT" && deuterocanonGoverned.has(file));
    })
    .sort();
}

function inspectCandidate(path) {
  const data = readJson(path);
  let rows = 0;
  let stringTextRows = 0;
  let objectTextRows = 0;
  let rawTextRows = 0;

  for (const chapter of chaptersOf(data)) {
    for (const verse of versesOf(chapter)) {
      rows++;
      const text = verse?.text;
      if (typeof text === "string" && text.trim()) stringTextRows++;
      if (text && typeof text === "object" && !Array.isArray(text)) {
        objectTextRows++;
        if (typeof text.rawText === "string" && text.rawText.trim()) rawTextRows++;
      }
    }
  }

  const meta = data.meta || {};
  return {
    path,
    rows,
    textShape: rows === 0 ? "zero_row" : stringTextRows === rows ? "string_text_only" : objectTextRows === rows && rawTextRows === rows ? "object_raw_text_only" : "mixed_or_unknown",
    hasConcreteSourcePointer: hasConcreteSourcePointer(meta)
  };
}

const failures = [];
const governance = readJson(governancePath);
const status = readJson(statusPath);
const adjudication = readJson(adjudicationPath);
const actualCandidates = broaderCandidates();
const inspected = actualCandidates.map(inspectCandidate);
const actualZeroRows = inspected.filter((item) => item.rows === 0).map((item) => item.path).sort();
const actualStringTextOnly = inspected.filter((item) => item.textShape === "string_text_only").map((item) => item.path).sort();
const actualConcreteSourcePointers = inspected.filter((item) => item.hasConcreteSourcePointer).map((item) => item.path).sort();

if (governance.schema !== "broader-canon-governance-v2") failures.push({ type: "schema-mismatch", actual: governance.schema });
if (governance.status !== "not_trust_ready_source_provenance_adjudication_recorded") failures.push({ type: "governance-status-mismatch", actual: governance.status });
if (governance.candidatePaths.join("\n") !== actualCandidates.join("\n")) failures.push({ type: "candidate-paths-changed" });
if ((governance.zeroRowPaths || []).join("\n") !== actualZeroRows.join("\n")) failures.push({ type: "zero-row-paths-mismatch", actualZeroRows });
if ((governance.stringTextOnlyPaths || []).join("\n") !== actualStringTextOnly.join("\n")) failures.push({ type: "string-text-only-paths-mismatch" });
if (actualConcreteSourcePointers.length !== 0) failures.push({ type: "unexpected-concrete-source-pointers", actualConcreteSourcePointers });

if (adjudication.status !== "not_trust_ready_source_provenance_insufficient") failures.push({ type: "adjudication-status-mismatch", actual: adjudication.status });
if (adjudication.trustReady !== false) failures.push({ type: "adjudication-trust-ready-mismatch" });
if (adjudication.summary?.candidateCount !== 38) failures.push({ type: "candidate-count-mismatch", actual: adjudication.summary?.candidateCount });
if (adjudication.summary?.zeroRowCount !== 3) failures.push({ type: "zero-row-count-mismatch", actual: adjudication.summary?.zeroRowCount });
if (adjudication.summary?.stringTextOnlyCount !== 35) failures.push({ type: "string-text-only-count-mismatch", actual: adjudication.summary?.stringTextOnlyCount });
if (adjudication.summary?.concreteSourcePointerCount !== 0) failures.push({ type: "concrete-source-pointer-count-mismatch", actual: adjudication.summary?.concreteSourcePointerCount });

const lane = status.lanes?.broader_canon;
if (!lane || lane.status !== "not_trusted_broader_canon_source_provenance_adjudication_required") failures.push({ type: "broader-canon-status-mismatch", actual: lane?.status || null });
if (!Array.isArray(lane?.completedRemediations) || !lane.completedRemediations.includes("broader_canon_source_provenance_adjudication_2026_07_03")) failures.push({ type: "missing-completed-remediation-marker" });
if (lane?.globalTextTrustPromotion !== "not_performed") failures.push({ type: "global-trust-promotion-mismatch", actual: lane?.globalTextTrustPromotion });
if (lane?.remainingNrsVApplicableGapRows !== 0) failures.push({ type: "remaining-nrsv-applicable-gap-mismatch", actual: lane?.remainingNrsVApplicableGapRows });

for (const blocked of [
  "broader_canon_textually_trusted",
  "broader_canon_complete",
  "broader_canon_global_trust_promoted",
  "broader_canon_trusted_from_meta_version_labels",
  "zero_row_files_complete",
  "string_text_files_source_verified_without_external_witness"
]) {
  if (!Array.isArray(lane?.blockedClaims) || !lane.blockedClaims.includes(blocked)) failures.push({ type: "missing-blocked-claim", blocked });
}

console.log(JSON.stringify({
  audit: "broader-canon-governance",
  status: failures.length ? "failed" : "passed",
  candidateCount: governance.candidateCount,
  zeroRowCount: governance.zeroRowPaths.length,
  stringTextOnlyCount: governance.stringTextOnlyPaths.length,
  concreteSourcePointerCount: actualConcreteSourcePointers.length,
  failures
}, null, 2));

if (failures.length) {
  console.log("ALL FAILED");
  console.log("NEXT: Review broader-canon source/provenance adjudication failures.");
} else {
  console.log("ALL PASSED");
  console.log("NEXT: Broader canon source/provenance blockers are recorded; source acquisition/collation remains.");
}

process.exit(failures.length ? 1 : 0);
