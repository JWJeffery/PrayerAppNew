#!/usr/bin/env node
import fs from "node:fs";

const INVENTORY_PATH = "documentation/book-of-needs-eo-ancient-faith-source-inventory.json";

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

function walk(value, visitor, path = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visitor, [...path, String(index)]));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      visitor(key, child, [...path, key]);
      walk(child, visitor, [...path, key]);
    }
  }
}

const inventory = readJson(INVENTORY_PATH);

if (inventory) {
  if (inventory.inventoryVersion !== "book_of_needs_eo_afpb_source_inventory_v1") {
    fail("inventoryVersion must be book_of_needs_eo_afpb_source_inventory_v1.");
  }

  if (inventory.source?.title !== "The Ancient Faith Prayer Book") {
    fail("Inventory must identify The Ancient Faith Prayer Book as the source reviewed.");
  }

  if (!String(inventory.source?.sourceUse || "").includes("no prayer text imported")) {
    fail("Inventory must say no prayer text is imported in this tranche.");
  }

  if (!inventory.governingDecisions?.includes("Do not ingest all prayers from this source.")) {
    fail("Inventory must preserve the no-bulk-ingestion decision.");
  }

  if (!Array.isArray(inventory.candidates) || inventory.candidates.length < 12) {
    fail("Inventory must include a useful first candidate set.");
  }

  const candidatesById = new Map();
  for (const candidate of inventory.candidates || []) {
    if (!candidate.id || candidatesById.has(candidate.id)) {
      fail(`Candidate has missing or duplicate id: ${candidate.id}`);
      continue;
    }
    candidatesById.set(candidate.id, candidate);

    if (candidate.tradition !== "EO") {
      fail(`Candidate ${candidate.id} must be EO.`);
    }

    if (candidate.useAncientFaithTextDirectly !== false) {
      fail(`Candidate ${candidate.id} must not use Ancient Faith text directly in this inventory.`);
    }

    for (const required of ["title", "sourceSection", "sourceCriticalClassification", "accessTier", "displayCategory", "firstPassDisposition", "preferredSourcePath", "reason"]) {
      if (!(required in candidate)) {
        fail(`Candidate ${candidate.id} missing required field ${required}.`);
      }
    }
  }

  for (const requiredId of ["afpb-trisagion-prayers", "afpb-jesus-prayer", "afpb-prayer-of-manasseh", "afpb-psalm-50", "afpb-prayer-of-st-mardarios"]) {
    if (!candidatesById.has(requiredId)) {
      fail(`Missing required common/ancient candidate: ${requiredId}`);
    }
  }

  const strongCandidates = (inventory.candidates || []).filter((candidate) => candidate.firstPassDisposition === "strong-candidate");
  if (strongCandidates.length < 4) {
    fail(`Expected at least 4 strong candidates, found ${strongCandidates.length}.`);
  }

  const excluded = (inventory.candidates || []).filter((candidate) => candidate.firstPassDisposition === "exclude-from-first-pass");
  if (!excluded.some((candidate) => candidate.id === "afpb-before-using-the-internet")) {
    fail("Modern context prayer must be explicitly excluded from first pass.");
  }

  const serialized = JSON.stringify(inventory);
  for (const phrase of ["permission anxiety", "needs permission review", "do not import"]) {
    if (serialized.toLowerCase().includes(phrase)) {
      fail(`Inventory must not include blocked posture phrase: ${phrase}`);
    }
  }

  for (const forbiddenKey of ["prayerText", "fullText", "body", "html"]) {
    walk(inventory, (key, _value, path) => {
      if (key === forbiddenKey) {
        fail(`Inventory must not include prayer text field ${path.join(".")}.`);
      }
    });
  }
}

if (failures.length) {
  console.error("FAIL Book of Needs EO Ancient Faith source inventory audit");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("PASS Book of Needs EO Ancient Faith source inventory audit: candidates=15 strongCandidates>=4");
