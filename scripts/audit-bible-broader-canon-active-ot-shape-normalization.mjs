#!/usr/bin/env node
import fs from "fs";

const recordPath = "data/bible/registry/broader-canon-active-ot-shape-normalization-2026-07-03.json";
const record = JSON.parse(fs.readFileSync(recordPath, "utf8"));
const failures = [];

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function chaptersOf(data) {
  return Array.isArray(data.chapters) ? data.chapters : Object.values(data.chapters || {});
}

function versesOf(chapter) {
  return Array.isArray(chapter.verses) ? chapter.verses : Object.values(chapter.verses || {});
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function countFile(path) {
  const data = readJson(path);
  let rows = 0;
  let nrsv = 0;
  let rawText = 0;
  let stringText = 0;

  for (const chapter of chaptersOf(data)) {
    for (const verse of versesOf(chapter)) {
      rows++;
      const text = verse?.text;
      if (typeof text === "string") stringText++;
      if (text && typeof text === "object" && !Array.isArray(text)) {
        if (hasText(text.NRSV)) nrsv++;
        if (hasText(text.rawText)) rawText++;
      }
    }
  }

  return { rows, nrsv, rawText, stringText };
}

const expected = {
  "data/bible/OT/3maccabees.json": { rows: 228, nrsv: 228, rawText: 0, stringText: 0 },
  "data/bible/OT/4maccabees.json": { rows: 479, nrsv: 479, rawText: 0, stringText: 0 },
  "data/bible/OT/prayerofmanasseh.json": { rows: 15, nrsv: 15, rawText: 0, stringText: 0 }
};

for (const [path, want] of Object.entries(expected)) {
  const got = countFile(path);
  for (const key of Object.keys(want)) {
    if (got[key] !== want[key]) {
      failures.push(`${path}: expected ${key}=${want[key]}, got ${got[key]}`);
    }
  }
}

if (record.status !== "active_ot_shape_normalized_existing_nrsv_text") failures.push("unexpected record status");
if (record.summary?.rowsNormalized !== 721) failures.push("expected 721 normalized rows");
if (record.summary?.textualContentAdded !== "none") failures.push("textual content must not be added");
if (record.summary?.textualContentInvented !== "none") failures.push("textual content must not be invented");
if (record.summary?.remainingKnownActiveOtNrsVGapRows !== 1210) failures.push("expected 1210 remaining known active OT NRSV gap rows");
if (record.summary?.globalTrustPromotion !== "not_performed") failures.push("global trust promotion must not be performed");
if ((record.failures || []).length) failures.push("record contains failures");

for (const claim of [
  "broader_canon_textually_trusted",
  "broader_canon_complete",
  "broader_canon_all_active_ot_nrsv_complete",
  "one_esdras_two_esdras_repaired",
  "broader_canon_global_trust_promoted"
]) {
  if (!(record.blockedClaims || []).includes(claim)) failures.push("missing blocked claim: " + claim);
}

console.log(JSON.stringify({
  audit: "broader_canon_active_ot_shape_normalization",
  status: failures.length ? "FAIL" : "PASS",
  recordPath,
  summary: record.summary,
  normalized: record.normalized,
  failures
}, null, 2));

process.exit(failures.length ? 1 : 0);
