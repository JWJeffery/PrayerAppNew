#!/usr/bin/env node
import fs from "fs";
import path from "path";

const repairPath = "data/bible/registry/deutero-01-catholic-nrsv-biblegateway-nrsva-repair.json";
const outputPath = "data/bible/registry/deutero-01-catholic-postrepair-source-shape-audit.json";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function firstNumber(source, keys) {
  for (const key of keys) {
    const value = source && source[key];
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
  return firstNumber(chapter, ["chapter", "number", "num", "chapterNumber", "chapter_number", "c"]) ?? parseTrailingNumber(chapter && chapter.id) ?? index + 1;
}

function verseNumber(verse, index) {
  return firstNumber(verse, ["verse", "number", "num", "verseNumber", "verse_number", "v"]) ?? parseTrailingNumber(verse && verse.id) ?? index + 1;
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

function refKey(chapter, verse) {
  return String(chapter) + ":" + String(verse);
}

function activeRows(activeData) {
  const rows = [];

  chaptersOf(activeData).forEach((chapter, chapterIndex) => {
    const c = chapterNumber(chapter, chapterIndex);
    versesOf(chapter).forEach((verse, verseIndex) => {
      const v = verseNumber(verse, verseIndex);
      rows.push({ ref: refKey(c, v), verse });
    });
  });

  return rows;
}

function sourceRows(sourceData) {
  const rows = [];

  for (const chapter of sourceData.chapters || []) {
    for (const verse of chapter.verses || []) {
      if (hasText(verse.text)) {
        rows.push({ ref: verse.ref, text: verse.text });
      }
    }
  }

  return rows;
}

function byRef(rows) {
  return new Map(rows.map((row) => [row.ref, row]));
}

const repair = readJson(repairPath);
const failures = [];
const books = [];

if (repair.status !== "source_backed_same_address_repair_completed") {
  failures.push("repair record is not completed");
}

if (!repair.books || repair.books.length !== 8) {
  failures.push("repair record must cover 8 DEUTERO-01 books");
}

for (const book of repair.books || []) {
  const active = readJson(book.activePath);
  const source = readJson(book.rawSourcePath);

  const activeList = activeRows(active);
  const sourceList = sourceRows(source);

  const activeMap = byRef(activeList);
  const sourceMap = byRef(sourceList);

  const sourceRefsWithoutActive = sourceList
    .filter((row) => !activeMap.has(row.ref))
    .map((row) => row.ref);

  const activeRefsWithoutSource = activeList
    .filter((row) => !sourceMap.has(row.ref))
    .map((row) => row.ref);

  const activeNrsVRows = activeList.filter((row) => hasText(row.verse.text?.NRSV)).map((row) => row.ref);
  const missingNrsVRows = activeList.filter((row) => !hasText(row.verse.text?.NRSV)).map((row) => row.ref);
  const noSourceButHasNrsV = activeList
    .filter((row) => !sourceMap.has(row.ref) && hasText(row.verse.text?.NRSV))
    .map((row) => row.ref);

  const mismatches = [];

  for (const sourceRow of sourceList) {
    const activeRow = activeMap.get(sourceRow.ref);
    if (activeRow && activeRow.verse.text?.NRSV !== sourceRow.text) {
      mismatches.push(sourceRow.ref);
    }
  }

  if (mismatches.length) {
    failures.push(book.id + " has NRSV mismatches: " + mismatches.slice(0, 5).join(", "));
  }

  books.push({
    id: book.id,
    activePath: book.activePath,
    rawSourcePath: book.rawSourcePath,
    sourceWitness: book.sourceWitness,
    activeRows: activeList.length,
    sourceRows: sourceList.length,
    activeNrsVRows: activeNrsVRows.length,
    missingNrsVRows: missingNrsVRows.length,
    sourceRefsWithoutActiveCount: sourceRefsWithoutActive.length,
    sourceRefsWithoutActive,
    activeRefsWithoutSourceCount: activeRefsWithoutSource.length,
    activeRefsWithoutSource,
    noSourceButHasNrsVCount: noSourceButHasNrsV.length,
    noSourceButHasNrsV,
    mismatchCount: mismatches.length,
    boundary: missingNrsVRows.length === 0
      ? "nrsv_same_address_complete_for_active_grid"
      : "nrsv_source_shape_boundary_remaining_active_refs_without_nrsva_source_rows",
    policy: "Do not synthesize or split NRSVA text for active refs absent from the source snapshot. Govern these rows as source-shape/source-scope boundary rows unless a separate adapter policy authorizes mapping."
  });
}

const report = {
  schema: "deutero-01-catholic-postrepair-source-shape-audit-v1",
  id: "deutero_01_catholic_postrepair_source_shape_audit_2026_07_02",
  status: failures.length ? "FAIL" : "PASS_REMAINING_SOURCE_SHAPE_BOUNDARIES_RECORDED",
  auditedAt: process.env.POSTREPAIR_AUDIT_STAMP || new Date().toISOString(),
  sourceRepair: repairPath,
  scope: {
    tranche: "DEUTERO-01",
    lane: "text.NRSV",
    sourceWitness: "BibleGateway NRSVA"
  },
  determination: {
    summary: "DEUTERO-01 Catholic deuterocanon NRSV repair is source-backed for exact same-address rows. Remaining empty NRSV rows are active-grid/source-shape boundary rows where the active grid contains addresses not present in the BibleGateway NRSVA source snapshot. These are not to be synthesized or split without adapter policy.",
    repairedClaimAllowed: "deutero_01_catholic_nrsv_source_backed_same_address_repair_completed",
    remainingBoundary: "active_grid_refs_without_nrsva_source_rows",
    blockedClaims: [
      "deutero_01_nrsv_active_grid_complete_without_source_shape_adapter",
      "deutero_01_nrsv_synthetic_fill",
      "deutero_01_nrsv_source_row_split_without_adapter_policy",
      "deuterocanon_textually_trusted_until_remaining_boundaries_close"
    ]
  },
  books,
  totals: {
    books: books.length,
    activeRows: books.reduce((sum, book) => sum + book.activeRows, 0),
    sourceRows: books.reduce((sum, book) => sum + book.sourceRows, 0),
    activeNrsVRows: books.reduce((sum, book) => sum + book.activeNrsVRows, 0),
    missingNrsVRows: books.reduce((sum, book) => sum + book.missingNrsVRows, 0),
    sourceRefsWithoutActive: books.reduce((sum, book) => sum + book.sourceRefsWithoutActiveCount, 0),
    activeRefsWithoutSource: books.reduce((sum, book) => sum + book.activeRefsWithoutSourceCount, 0),
    noSourceButHasNrsV: books.reduce((sum, book) => sum + book.noSourceButHasNrsVCount, 0),
    mismatches: books.reduce((sum, book) => sum + book.mismatchCount, 0)
  },
  failures
};

writeJson(outputPath, report);
console.log(JSON.stringify(report, null, 2));

process.exit(failures.length ? 1 : 0);
