#!/usr/bin/env node
import fs from "node:fs";

const REVIEW_PATH = "documentation/book-of-needs-anglican-taxonomy-review.json";
const PRAYERS_JS_PATH = "js/prayers.js";
const PRAYERS_JSON_PATH = "data/prayers.json";

const failures = [];

function fail(message) {
  failures.push(message);
}

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch (error) {
    fail(`${path} is not readable JSON: ${error.message}`);
    return null;
  }
}

function extractTraditionMap(text) {
  const match = text.match(/const BOOK_OF_NEEDS_OPTION_TRADITIONS = \{([\s\S]*?)\n\};/);
  if (!match) {
    fail("Could not locate BOOK_OF_NEEDS_OPTION_TRADITIONS in js/prayers.js.");
    return {};
  }

  const map = {};
  const linePattern = /'([^']+)'\s*:\s*\[([^\]]*)\]/g;
  let lineMatch;

  while ((lineMatch = linePattern.exec(match[1])) !== null) {
    const id = lineMatch[1];
    const traditions = lineMatch[2]
      .split(",")
      .map((item) => item.trim().replace(/^'|'$/g, ""))
      .filter(Boolean);
    map[id] = traditions;
  }

  return map;
}

const review = readJson(REVIEW_PATH);
const prayers = readJson(PRAYERS_JSON_PATH);
const traditionMap = extractTraditionMap(fs.readFileSync(PRAYERS_JS_PATH, "utf8"));

if (review && prayers) {
  if (review.reviewVersion !== "book_of_needs_anglican_taxonomy_review_v1") {
    fail("reviewVersion must be book_of_needs_anglican_taxonomy_review_v1.");
  }

  if (review.governancePosture?.diagnosticOnly !== true) {
    fail("Review must remain diagnostic-only.");
  }

  if (review.governancePosture?.noRuntimeRetaggingInThisTranche !== true) {
    fail("Review must explicitly avoid runtime retagging in this tranche.");
  }

  const liveAngIds = Object.entries(traditionMap)
    .filter(([, traditions]) => traditions.includes("ANG"))
    .map(([id]) => id)
    .sort();

  const reviewIds = (review.entries || []).map((entry) => entry.id).sort();

  if (liveAngIds.length !== 25) {
    fail(`Expected 25 live ANG assignments, found ${liveAngIds.length}.`);
  }

  if (review.entries?.length !== 25) {
    fail(`Expected 25 reviewed ANG entries, found ${review.entries?.length || 0}.`);
  }

  const missingFromReview = liveAngIds.filter((id) => !reviewIds.includes(id));
  const extraInReview = reviewIds.filter((id) => !liveAngIds.includes(id));

  if (missingFromReview.length) {
    fail(`Live ANG ids missing from review: ${missingFromReview.join(", ")}`);
  }

  if (extraInReview.length) {
    fail(`Review ids not assigned ANG in runtime map: ${extraInReview.join(", ")}`);
  }

  for (const entry of review.entries || []) {
    const prayer = prayers[entry.id];

    if (!prayer) {
      fail(`Reviewed entry missing from data/prayers.json: ${entry.id}`);
      continue;
    }

    if (entry.title !== prayer.title) {
      fail(`Reviewed title mismatch for ${entry.id}: expected "${prayer.title}", found "${entry.title}".`);
    }

    if (!Array.isArray(entry.currentTraditions) || !entry.currentTraditions.includes("ANG")) {
      fail(`Reviewed entry must include currentTraditions ANG: ${entry.id}`);
    }

    if (!entry.sourceBasis || typeof entry.sourceBasis !== "string") {
      fail(`Reviewed entry missing sourceBasis: ${entry.id}`);
    }

    if (!entry.classification || typeof entry.classification !== "string") {
      fail(`Reviewed entry missing classification: ${entry.id}`);
    }

    if (!entry.reviewDisposition || typeof entry.reviewDisposition !== "string") {
      fail(`Reviewed entry missing reviewDisposition: ${entry.id}`);
    }
  }

  const classificationCounts = {};
  for (const entry of review.entries || []) {
    classificationCounts[entry.classification] = (classificationCounts[entry.classification] || 0) + 1;
  }

  const expectedClassificationCounts = {
    "explicit-bcp": 8,
    "anglican-divine": 6,
    "anglican-tradition": 4,
    "western-shared-devotional": 1,
    "western-shared-vesting": 6
  };

  for (const [classification, expectedCount] of Object.entries(expectedClassificationCounts)) {
    if (classificationCounts[classification] !== expectedCount) {
      fail(`Expected ${expectedCount} ${classification} entries, found ${classificationCounts[classification] || 0}.`);
    }
  }

  if (review.summaryCounts?.strongAnglicanBasis !== 18) {
    fail("summaryCounts.strongAnglicanBasis must be 18.");
  }

  if (review.summaryCounts?.notAnglicanExclusive !== 7) {
    fail("summaryCounts.notAnglicanExclusive must be 7.");
  }

  const nonExclusive = (review.entries || []).filter((entry) => entry.reviewDisposition === "not-anglican-exclusive");
  if (nonExclusive.length !== 7) {
    fail(`Expected 7 not-anglican-exclusive entries, found ${nonExclusive.length}.`);
  }

  const serialized = JSON.stringify(review);
  for (const forbidden of ["UNIVERSAL", "COMMON_PRAYER", "ALL"]) {
    if (serialized.includes(`"${forbidden}"`)) {
      fail(`Forbidden runtime assignment bucket appears in review: ${forbidden}`);
    }
  }

  if (/needs[- ]permission[- ]review|do not import|permission anxiety/i.test(serialized)) {
    fail("Review must not reintroduce permission-anxiety/import-blocking language.");
  }
}

if (failures.length) {
  console.error("FAIL Book of Needs Anglican taxonomy review audit");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("PASS Book of Needs Anglican taxonomy review audit: entries=25 strongAnglicanBasis=18 notAnglicanExclusive=7");
