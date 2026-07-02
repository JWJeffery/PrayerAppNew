#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const adapter = require("../js/bible-browser/bible-source-lane-adapter.js");

const sourceShapePath = "data/bible/translations/drb-original-douay-rheims/source-shape-adapter.json";
const sourceShape = JSON.parse(fs.readFileSync(sourceShapePath, "utf8"));

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function activeRowFor(activeFile, ref) {
  const [chapterText, verseText] = ref.split(":");
  const chapterNum = Number(chapterText);
  const verseNum = Number(verseText);
  const active = readJson(path.join("data/bible/OT", activeFile));
  const chapter = (active.chapters || []).find((candidate) => Number(candidate.num) === chapterNum);
  if (!chapter) return null;
  return (chapter.verses || []).find((candidate) => Number(candidate.num) === verseNum) || null;
}

const failures = [];
let mappedRows = 0;
let nativeRefsChecked = 0;
let resolverRowsChecked = 0;

for (const [bookId, bookRecord] of Object.entries(sourceShape.books || {})) {
  for (const [activeRef, rule] of Object.entries(bookRecord.activeRefs || {})) {
    mappedRows += 1;

    const activeRow = activeRowFor(bookRecord.activeFile, activeRef);
    if (!activeRow) {
      failures.push({ bookId, activeRef, failure: "missing_active_row" });
      continue;
    }

    if (hasText(activeRow.text && activeRow.text.DRB)) {
      failures.push({ bookId, activeRef, failure: "active_text_drb_should_remain_empty" });
    }

    const sourcePath = adapter.sourcePathFor(adapter.getLane("DRB_ORIGINAL"), bookId);
    const sourceBook = readJson(sourcePath);
    const sourceRows = adapter._internals.extractRefs(sourceBook, rule.nativeRefs || []);

    nativeRefsChecked += (rule.nativeRefs || []).length;

    if (sourceRows.length !== (rule.nativeRefs || []).length) {
      failures.push({
        bookId,
        activeRef,
        failure: "native_ref_missing_or_empty",
        expectedNativeRefs: rule.nativeRefs,
        foundNativeRows: sourceRows
      });
    }

    const [chapterText, verseText] = activeRef.split(":");
    const resolved = await adapter.resolvePassage({
      laneId: "DRB_ORIGINAL",
      bookId,
      chapter: Number(chapterText),
      verseStart: Number(verseText),
      verseEnd: Number(verseText)
    }, { readJson });

    resolverRowsChecked += 1;

    if (!hasText(resolved.text)) {
      failures.push({ bookId, activeRef, failure: "resolver_text_empty" });
    }

    const event = (resolved.sourceShapeEvents || []).find((candidate) => candidate.activeRef === activeRef);
    if (!event) {
      failures.push({ bookId, activeRef, failure: "resolver_missing_source_shape_event" });
    }
  }
}

const result = {
  audit: "canonical_ot_drb_source_shape_adapter",
  status: failures.length ? "FAIL" : "PASS",
  sourceShapePath,
  mappedRows,
  nativeRefsChecked,
  resolverRowsChecked,
  activeTextMutationExpected: false,
  failures
};

console.log(JSON.stringify(result, null, 2));

if (failures.length) {
  process.exit(1);
}
