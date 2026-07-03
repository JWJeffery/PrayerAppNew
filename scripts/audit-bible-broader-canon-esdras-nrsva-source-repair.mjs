#!/usr/bin/env node
import fs from "fs";

const recordPath = "data/bible/registry/broader-canon-esdras-nrsva-source-repair-2026-07-03.json";
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

function countActive(path) {
  const data = readJson(path);
  let rows = 0;
  let nrsv = 0;
  let missing = 0;
  for (const chapter of chaptersOf(data)) {
    for (const verse of versesOf(chapter)) {
      rows++;
      const text = verse?.text;
      if (text && typeof text === "object" && !Array.isArray(text) && hasText(text.NRSV)) nrsv++;
      else missing++;
    }
  }
  return { rows, nrsv, missing };
}

function countRaw(path) {
  const data = readJson(path);
  let rows = 0;
  for (const chapter of chaptersOf(data)) {
    for (const verse of versesOf(chapter)) {
      rows++;
      if (!hasText(verse?.text)) failures.push(`${path}: raw source row without text`);
    }
  }
  return rows;
}

if (record.status !== "esdras_nrsva_source_repair_complete_with_measured_grid_mismatch_governed") failures.push("unexpected record status");
if (record.summary?.sourceWitness !== "BibleGateway NRSVA") failures.push("unexpected source witness");
if (record.summary?.sourceSnapshotsWritten !== 2) failures.push("expected two source snapshots");
if (record.summary?.activeBooksRepaired !== 2) failures.push("expected two active books repaired");
if (!(record.summary?.activeRowsChecked > 0)) failures.push("active rows checked must be positive");
if (!(record.summary?.rowsRepaired > 0)) failures.push("rows repaired must be positive");
if (record.summary?.remainingNrsVApplicableGapRows !== 0) failures.push("expected zero remaining applicable NRSV gaps");
if (record.summary?.syntheticRows !== 0) failures.push("synthetic rows must be zero");
if (record.summary?.globalTrustPromotion !== "not_performed") failures.push("global trust promotion must not be performed");
if ((record.failures || []).length) failures.push("record contains failures");

const activeChecks = {
  "1ESDRAS": "data/bible/OT/1esdras.json",
  "2ESDRAS": "data/bible/OT/2esdras.json"
};

for (const [book, path] of Object.entries(activeChecks)) {
  const got = countActive(path);
  const rec = record.books?.[book];
  if (!rec) {
    failures.push(`missing record book entry: ${book}`);
    continue;
  }
  const expectedMissing = rec.repair?.activeOnlyMissingRowsWithoutNrsVAfterRepair;
  const expectedRows = rec.before?.activeRowCount;
  const expectedNrsv = rec.repair?.nrsVRowsAfterRepair;
  if (got.rows !== expectedRows) failures.push(`${path}: active row count mismatch against record`);
  if (got.nrsv !== expectedNrsv) failures.push(`${path}: NRSV row count mismatch against record`);
  if (got.missing !== expectedMissing) failures.push(`${path}: missing NRSV count mismatch against record`);
}

const rawChecks = {
  "1ESDRAS": "data/bible/translations/nrsv-biblegateway-nrsva/raw/1esdras.json",
  "2ESDRAS": "data/bible/translations/nrsv-biblegateway-nrsva/raw/2esdras.json"
};

for (const [book, path] of Object.entries(rawChecks)) {
  const got = countRaw(path);
  const expected = record.books?.[book]?.source?.sourceRowCount;
  if (got !== expected) failures.push(`${path}: raw row count mismatch against record`);
}

const totalRowsRepaired = Object.values(record.books || {}).reduce((sum, book) => sum + (book.repair?.rowsRepaired || 0), 0);
const totalActiveOnly = Object.values(record.books || {}).reduce((sum, book) => sum + (book.repair?.activeOnlyMissingRowsWithoutNrsVAfterRepair || 0), 0);
const totalSourceOnly = Object.values(record.books || {}).reduce((sum, book) => sum + (book.repair?.sourceOnlyRowsNotInActiveGrid || 0), 0);

if (totalRowsRepaired !== record.summary?.rowsRepaired) failures.push("record summary rowsRepaired does not equal book repair sum");
if (totalActiveOnly !== record.summary?.activeOnlyMissingRowsWithoutNrsVAfterRepair) failures.push("record summary active-only mismatch does not equal book sum");
if (totalSourceOnly !== record.summary?.sourceRowsNotInActiveGrid) failures.push("record summary source-only mismatch does not equal book sum");

for (const claim of [
  "broader_canon_textually_trusted",
  "broader_canon_complete",
  "broader_canon_global_trust_promoted",
  "broader_canon_raw_candidate_corpus_source_verified",
  "public_rendering_permission_resolved",
  "active_source_grid_mismatch_rows_are_textual_defects",
  "source_only_rows_were_forced_into_active_grid"
]) {
  if (!(record.blockedClaims || []).includes(claim)) failures.push("missing blocked claim: " + claim);
}

console.log(JSON.stringify({
  audit: "broader_canon_esdras_nrsva_source_repair",
  status: failures.length ? "FAIL" : "PASS",
  recordPath,
  summary: record.summary,
  measuredRepairPlan: {
    "1ESDRAS": record.books?.["1ESDRAS"]?.measuredRepairPlan,
    "2ESDRAS": record.books?.["2ESDRAS"]?.measuredRepairPlan
  },
  failures
}, null, 2));

process.exit(failures.length ? 1 : 0);
