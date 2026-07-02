#!/usr/bin/env node
import fs from "fs";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function chaptersOf(data) {
  if (Array.isArray(data?.chapters)) return data.chapters;
  if (data?.chapters && typeof data.chapters === "object") return Object.values(data.chapters);
  if (Array.isArray(data)) return data;
  return [];
}

function versesOf(chapter) {
  if (Array.isArray(chapter?.verses)) return chapter.verses;
  if (chapter?.verses && typeof chapter.verses === "object") return Object.values(chapter.verses);
  return [];
}

function firstNumber(source, keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") {
      const number = Number(value);
      if (Number.isFinite(number)) return number;
    }
  }
  return null;
}

function parseTrailingNumber(value) {
  const match = String(value || "").match(/(\d+)\s*$/);
  if (!match) return null;
  const number = Number(match[1]);
  return Number.isFinite(number) ? number : null;
}

function chapterNumber(chapter, index) {
  return firstNumber(chapter, ["chapter", "number", "num", "chapterNumber", "chapter_number", "c"]) ?? parseTrailingNumber(chapter?.id) ?? index + 1;
}

function verseNumber(verse, index) {
  return firstNumber(verse, ["verse", "number", "num", "verseNumber", "verse_number", "v"]) ?? parseTrailingNumber(verse?.id) ?? index + 1;
}

function refKey(chapter, verse) {
  return String(chapter) + ":" + String(verse);
}

function activeRowMap(data) {
  const map = new Map();
  chaptersOf(data).forEach((chapter, chapterIndex) => {
    const c = chapterNumber(chapter, chapterIndex);
    versesOf(chapter).forEach((verse, verseIndex) => {
      const v = verseNumber(verse, verseIndex);
      map.set(refKey(c, v), verse);
    });
  });
  return map;
}

const repairPath = "data/bible/registry/deutero-02-greek-esther-tail-nrsv-repair.json";
const repair = readJson(repairPath);
const rawSource = readJson("data/bible/translations/nrsv-biblegateway-nrsva/raw/estherGK-8-13-17-esther-8-nrsva-source.json");
const esther = readJson("data/bible/OT/estherGK.json");
const daniel = readJson("data/bible/OT/danielGK.json");

const failures = [];

if (repair.status !== "nrsv_applicable_gap_repair_completed") {
  failures.push("repair status mismatch");
}

const estherRows = activeRowMap(esther);
for (const ref of ["8:13", "8:14", "8:15", "8:16", "8:17"]) {
  const activeText = estherRows.get(ref)?.text?.NRSV;
  const sourceText = rawSource.sourceRows?.[ref];

  if (!hasText(activeText)) failures.push("Greek Esther missing NRSV after repair at " + ref);
  if (!hasText(sourceText)) failures.push("Missing source text for " + ref);
  if (activeText !== sourceText) failures.push("Greek Esther/source mismatch after repair at " + ref);
}

const danielRows = activeRowMap(daniel);
const daniel1365 = danielRows.get("13:65");
const daniel141 = danielRows.get("14:1");

if (!daniel1365) failures.push("Daniel 13:65 row missing");
if (hasText(daniel1365?.text?.NRSV)) failures.push("Daniel 13:65 must remain NRSV-not-applicable, not filled");
if (!hasText(daniel1365?.text?.DRB)) failures.push("Daniel 13:65 expected DRB witness missing");
if (!hasText(daniel141?.text?.NRSV)) failures.push("Daniel 14:1 NRSV Bel opening missing");

if (repair.totals?.nrsvApplicableMissingRowsAfter !== 0) {
  failures.push("NRSV-applicable missing rows after repair must be zero");
}

for (const claim of [
  "deutero_02_daniel_13_65_filled_with_duplicate_or_synthetic_nrsv",
  "deutero_02_repaired_from_prior_nrsva_diagnostic_snapshot",
  "deuterocanon_textually_trusted_without_status_consolidation"
]) {
  if (!(repair.blockedClaims || []).includes(claim)) {
    failures.push("missing blocked claim: " + claim);
  }
}

const result = {
  audit: "deutero_02_greek_esther_tail_nrsv_repair",
  status: failures.length ? "FAIL" : "PASS",
  repairPath,
  totals: repair.totals,
  failures
};

console.log(JSON.stringify(result, null, 2));
process.exitCode = failures.length ? 1 : 0;
