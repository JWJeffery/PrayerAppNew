#!/usr/bin/env node
import fs from "fs";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const sourceAuditPath = "data/bible/registry/deuterocanon-catholic-source-candidate-audit.json";
const boundaryPath = "data/bible/registry/deuterocanon-catholic-source-scope-boundaries.json";

const sourceAudit = readJson(sourceAuditPath);
const boundary = readJson(boundaryPath);

const failures = [];

if (sourceAudit.totals?.targetBooks !== 8) {
  failures.push("source candidate audit must cover 8 DEUTERO-01 books");
}

if (sourceAudit.totals?.booksWithNrsVSourceBlockedLocally !== 8) {
  failures.push("all 8 DEUTERO-01 books must remain NRSV source-blocked locally");
}

if (boundary.status !== "recorded_source_blockers_and_source_scope_boundaries_no_text_mutation") {
  failures.push("boundary status mismatch");
}

if ((boundary.books || []).length !== 8) {
  failures.push("boundary record must cover 8 books");
}

for (const book of boundary.books || []) {
  if (book.boundary?.NRSV !== "source_blocked_locally_no_text_mutation_authorized") {
    failures.push(book.id + " NRSV boundary is not source-blocked");
  }

  if (book.boundary?.Rotherham !== "source_scope_absent_no_text_mutation_authorized") {
    failures.push(book.id + " Rotherham boundary is not source-scope absent");
  }
}

for (const claim of [
  "deuterocanon_textually_trusted",
  "deutero_01_nrsv_repaired_without_source_witness",
  "broad_canon_repair_started_before_deuterocanon_boundary_closure"
]) {
  if (!(boundary.blockedClaims || []).includes(claim)) {
    failures.push("missing blocked claim: " + claim);
  }
}

const result = {
  audit: "deuterocanon_catholic_source_scope_boundaries",
  status: failures.length ? "FAIL" : "PASS",
  sourceAuditPath,
  boundaryPath,
  targetBooks: sourceAudit.totals?.targetBooks,
  nrsvSourceBlockedBooks: sourceAudit.totals?.booksWithNrsVSourceBlockedLocally,
  failures
};

console.log(JSON.stringify(result, null, 2));
process.exit(failures.length ? 1 : 0);
