#!/usr/bin/env node
import fs from "fs";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
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

function sourceRowsByRef(snapshot) {
  const map = new Map();
  for (const chapter of snapshot.chapters || []) {
    for (const verse of chapter.verses || []) {
      if (hasText(verse.text)) map.set(verse.ref, verse.text);
    }
  }
  return map;
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

const repair = readJson("data/bible/registry/deutero-01-catholic-nrsv-biblegateway-nrsva-repair.json");
const failures = [];

if (repair.status !== "source_backed_same_address_repair_completed") failures.push("repair status mismatch");
if (!repair.books || repair.books.length !== 8) failures.push("repair must cover 8 books");

for (const book of repair.books || []) {
  const active = readJson(book.activePath);
  const source = readJson(book.rawSourcePath);
  const sourceMap = sourceRowsByRef(source);
  const rows = activeRows(active);
  const activeRefSet = new Set(rows.map((row) => row.ref));

  for (const row of rows) {
    const sourceText = sourceMap.get(row.ref);
    if (sourceText && row.verse.text?.NRSV !== sourceText) {
      failures.push(book.id + " active NRSV mismatch at " + row.ref);
      break;
    }
  }

  for (const ref of book.sourceRefsWithoutActive || []) {
    if (activeRefSet.has(ref)) {
      failures.push(book.id + " sourceRefsWithoutActive incorrectly includes active ref " + ref);
      break;
    }
  }

  for (const ref of book.activeRefsWithoutSource || []) {
    if (sourceMap.has(ref)) {
      failures.push(book.id + " activeRefsWithoutSource incorrectly includes source ref " + ref);
      break;
    }
  }
}

const result = {
  audit: "deutero_01_catholic_nrsv_biblegateway_nrsva_repair",
  status: failures.length ? "FAIL" : "PASS",
  books: repair.books ? repair.books.length : 0,
  totals: repair.totals,
  failures
};

console.log(JSON.stringify(result, null, 2));
process.exit(failures.length ? 1 : 0);
