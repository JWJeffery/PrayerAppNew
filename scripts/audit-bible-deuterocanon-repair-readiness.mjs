#!/usr/bin/env node
import fs from "fs";
import path from "path";

const expectedLanes = ["DRB", "KJV", "NABRE", "NRSV", "Rotherham"];

const deuterocanonBooks = [
  { id: "TOBIT", file: "tobit.json", class: "catholic_deuterocanon" },
  { id: "JUDITH", file: "judith.json", class: "catholic_deuterocanon" },
  { id: "WISDOM", file: "wisdom.json", class: "catholic_deuterocanon" },
  { id: "SIRACH", file: "sirach.json", class: "catholic_deuterocanon" },
  { id: "BARUCH", file: "baruch.json", class: "catholic_deuterocanon" },
  { id: "LETTER_OF_JEREMIAH", file: "letterofjeremiah.json", class: "catholic_deuterocanon_or_baruch_extension" },
  { id: "1_MACCABEES", file: "1maccabees.json", class: "catholic_deuterocanon" },
  { id: "2_MACCABEES", file: "2maccabees.json", class: "catholic_deuterocanon" },
  { id: "PRAYER_OF_MANASSEH", file: "prayerofmanasseh.json", class: "apocrypha_deuterocanon_boundary" },
  { id: "1_ESDRAS", file: "1esdras.json", class: "apocrypha_deuterocanon_boundary" },
  { id: "2_ESDRAS", file: "2esdras.json", class: "apocrypha_deuterocanon_boundary" },
  { id: "3_MACCABEES", file: "3maccabees.json", class: "broader_orthodox_deuterocanon_boundary" },
  { id: "4_MACCABEES", file: "4maccabees.json", class: "broader_orthodox_deuterocanon_boundary" },
  { id: "GREEK_ESTHER", file: "greekesther.json", class: "greek_addition_form_policy_required" },
  { id: "GREEK_DANIEL", file: "greekdaniel.json", class: "greek_addition_form_policy_required" }
];

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
  return (
    firstNumber(chapter, ["chapter", "number", "num", "chapterNumber", "chapter_number", "c"]) ??
    parseTrailingNumber(chapter && chapter.id) ??
    index + 1
  );
}

function verseNumber(verse, index) {
  return (
    firstNumber(verse, ["verse", "number", "num", "verseNumber", "verse_number", "v"]) ??
    parseTrailingNumber(verse && verse.id) ??
    index + 1
  );
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

function classifyTextShape(rawText) {
  if (typeof rawText === "string") {
    return {
      kind: hasText(rawText) ? "non_laned_string_text" : "empty_string_text",
      laneObject: {},
      nonLanedStringText: hasText(rawText)
    };
  }

  if (rawText && typeof rawText === "object" && !Array.isArray(rawText)) {
    return {
      kind: "translation_lane_object",
      laneObject: rawText,
      nonLanedStringText: false
    };
  }

  if (rawText === undefined || rawText === null) {
    return {
      kind: "missing_text_container",
      laneObject: {},
      nonLanedStringText: false
    };
  }

  return {
    kind: Array.isArray(rawText) ? "array_text_container" : "unsupported_text_container",
    laneObject: {},
    nonLanedStringText: false
  };
}

function repairPriorityFor(book, emptyLaneSummary, nonLanedStringTextRows) {
  if (book.class.includes("greek_addition")) return "manual_form_and_versification_policy_first";
  if (book.class.includes("broader_orthodox")) return "broader_canon_boundary_classification_before_trust_promotion";
  if (nonLanedStringTextRows > 0) return "normalize_non_laned_text_container_or_record_source_scope_policy";
  if (Object.values(emptyLaneSummary).some((count) => count > 0)) return "source_scope_or_source_shape_adapter_repair";
  return "candidate_for_source_trust_certification_audit";
}

function inspectBook(book) {
  const activePath = path.join("data/bible/OT", book.file);

  if (!fs.existsSync(activePath)) {
    return {
      ...book,
      activePath,
      exists: false,
      rowCount: 0,
      laneCounts: {},
      emptyLaneSummary: {},
      missingRowsByLaneSample: {},
      textShapeCounts: {},
      nonLanedStringTextRows: 0,
      invalidRefs: [],
      repairPriority: "source_or_scope_decision_required"
    };
  }

  const data = readJson(activePath);
  const chapters = chaptersOf(data);
  const rows = [];
  const invalidRefs = [];

  chapters.forEach((chapter, chapterIndex) => {
    const c = chapterNumber(chapter, chapterIndex);

    versesOf(chapter).forEach((verse, verseIndex) => {
      const v = verseNumber(verse, verseIndex);
      const ref = refKey(c, v);
      const textShape = classifyTextShape(verse.text);

      if (!Number.isFinite(c) || !Number.isFinite(v) || ref.includes("undefined") || ref.includes("NaN")) {
        invalidRefs.push({ chapterIndex, verseIndex, ref });
      }

      rows.push({
        ref,
        textShapeKind: textShape.kind,
        nonLanedStringText: textShape.nonLanedStringText,
        text: textShape.laneObject
      });
    });
  });

  const laneCounts = {};
  const emptyLaneSummary = {};
  const samples = {};
  const presentTextKeys = new Set();
  const textShapeCounts = {};
  let nonLanedStringTextRows = 0;

  for (const row of rows) {
    textShapeCounts[row.textShapeKind] = (textShapeCounts[row.textShapeKind] || 0) + 1;
    if (row.nonLanedStringText) nonLanedStringTextRows += 1;

    for (const key of Object.keys(row.text || {})) {
      if (hasText(row.text[key])) presentTextKeys.add(key);
    }
  }

  for (const lane of expectedLanes) {
    const missing = rows.filter((row) => !hasText(row.text[lane])).map((row) => row.ref);
    laneCounts[lane] = rows.length - missing.length;
    emptyLaneSummary[lane] = missing.length;
    samples[lane] = missing.slice(0, 25);
  }

  return {
    ...book,
    activePath,
    exists: true,
    structuralShape: chapters.length ? "chapter_verse_container" : "present_but_no_chapter_array",
    chapterCount: chapters.length,
    rowCount: rows.length,
    presentTextKeys: Array.from(presentTextKeys).sort(),
    textShapeCounts,
    nonLanedStringTextRows,
    laneCounts,
    emptyLaneSummary,
    missingRowsByLaneSample: samples,
    invalidRefs,
    repairPriority: repairPriorityFor(book, emptyLaneSummary, nonLanedStringTextRows)
  };
}

const auditedAt = process.env.DEUTERO_AUDIT_STAMP || new Date().toISOString();

const result = {
  schema: "deuterocanon-repair-readiness-audit-v1",
  id: "deuterocanon_repair_readiness_audit_2026_07_02",
  audit: "deuterocanon_repair_readiness_audit",
  status: "PASS_CLASSIFIED_NOT_TRUSTED",
  auditedAt,
  purpose: "Start Deuterocanon repair after Original DRB source-shape trust certification. This audit classifies active files, lane coverage, text-container shape, and first repair priorities without mutating Bible text.",
  expectedLanes,
  books: deuterocanonBooks.map(inspectBook)
};

result.totals = {
  bookTargets: result.books.length,
  existingFiles: result.books.filter((book) => book.exists).length,
  missingFiles: result.books.filter((book) => !book.exists).length,
  totalRows: result.books.reduce((sum, book) => sum + (book.rowCount || 0), 0),
  invalidRefCount: result.books.reduce((sum, book) => sum + (book.invalidRefs || []).length, 0),
  nonLanedStringTextRows: result.books.reduce((sum, book) => sum + (book.nonLanedStringTextRows || 0), 0)
};

result.repairOrder = [
  {
    tranche: "DEUTERO-01",
    title: "Catholic deuterocanon source-shape/source-scope certification",
    scope: ["tobit", "judith", "wisdom", "sirach", "baruch", "letterofjeremiah", "1maccabees", "2maccabees"],
    rule: "Certify rows only by source address, governed source-shape adapter, or recorded source-scope absence. No synthetic fills and no splitting without adapter policy."
  },
  {
    tranche: "DEUTERO-02",
    title: "Greek Esther and Greek Daniel form policy",
    scope: ["greekesther", "greekdaniel"],
    rule: "Resolve form, Catholic/Greek addition boundaries, and versification policy before text mutation or trust promotion."
  },
  {
    tranche: "DEUTERO-03",
    title: "Apocrypha/broader-boundary deuterocanon books",
    scope: ["prayerofmanasseh", "1esdras", "2esdras", "3maccabees", "4maccabees"],
    rule: "Keep source-scope absences, non-laned text containers, and variant-footnote material governed unless a variant apparatus, lane normalization, or source-address display policy is created."
  },
  {
    tranche: "BROAD-CANON-NEXT",
    title: "Broad canon repair begins only after Deuterocanon closure",
    scope: ["broader_canon"],
    rule: "Do not promote or repair broad canon until Deuterocanon has a trust certification or explicit blocked-boundary record."
  }
];

console.log(JSON.stringify(result, null, 2));

if (process.argv.includes("--write")) {
  writeJson("data/bible/registry/deuterocanon-repair-readiness-audit.json", result);
}

if (result.totals.existingFiles === 0 || result.totals.invalidRefCount !== 0) {
  process.exit(1);
}
