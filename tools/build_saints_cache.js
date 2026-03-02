#!/usr/bin/env node
/**
 * tools/build_saints_cache.js
 *
 * Reads the normalized source-of-truth files:
 *   data/saints/identities.json
 *   data/saints/commemorations.json
 *
 * Generates runtime cache files:
 *   data/saints/saints-{month}.json
 *
 * Usage:
 *   node tools/build_saints_cache.js              # generates all months present in commemorations
 *   node tools/build_saints_cache.js march        # generates saints-march.json only
 *   node tools/build_saints_cache.js march april  # generates two months
 *
 * Tag emission rules (transitional):
 *   - Each generated record's `tags` array includes the tradition code(s) for that commemoration day.
 *   - When a single identity has commemorations in ALL five traditions on the same date,
 *     the generated record receives the full five-code set ["ANG","LAT","EOR","OOR","COE"]
 *     so the runtime UI can derive the ECU (ecumenical) display label without code changes.
 */

"use strict";

const fs = require("fs");
const path = require("path");

// ── Month helpers ────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  "", // 1-indexed
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_SLUGS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

// Single source of truth for “all traditions”
const ALL_TRADITIONS = ["ANG", "LAT", "EOR", "OOR", "COE"];

// ── Paths (relative to project root; cwd-independent) ────────────────────────
// LANDMARK: this line should exist in your current script.
const ROOT = path.resolve(__dirname, "..");
const IDENTITIES_PATH = path.join(ROOT, "data", "saints", "identities.json");
const COMMEMORATIONS_PATH = path.join(ROOT, "data", "saints", "commemorations.json");

// ── File helpers ─────────────────────────────────────────────────────────────
function loadJson(p) {
  const text = fs.readFileSync(p, "utf8");
  return JSON.parse(text);
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function die(msg) {
  process.stderr.write(msg + "\n");
  process.exit(1);
}

// ── Validation (lightweight, generator-focused) ──────────────────────────────
function validateInputs(identities, commemorations) {
  if (!Array.isArray(identities)) die(`ERROR: identities.json must be an array`);
  if (!Array.isArray(commemorations)) die(`ERROR: commemorations.json must be an array`);

  const seen = new Set();
  for (const i of identities) {
    if (!i || typeof i !== "object") die(`ERROR: identity is not an object: ${JSON.stringify(i)}`);
    if (!i.id || typeof i.id !== "string") die(`ERROR: identity missing string id: ${JSON.stringify(i)}`);
    if (seen.has(i.id)) die(`ERROR: duplicate identity id "${i.id}"`);
    seen.add(i.id);
    if (!i.name || typeof i.name !== "string") die(`ERROR: identity "${i.id}" missing name`);
    if (!i.description || typeof i.description !== "string") die(`ERROR: identity "${i.id}" missing description`);
    if (!i.type || typeof i.type !== "string") die(`ERROR: identity "${i.id}" missing type`);
  }

  for (const c of commemorations) {
    if (!c || typeof c !== "object") die(`ERROR: commemoration is not an object: ${JSON.stringify(c)}`);
    if (!c.identity_id || typeof c.identity_id !== "string") die(`ERROR: commemoration missing identity_id: ${JSON.stringify(c)}`);
    if (!seen.has(c.identity_id)) die(`ERROR: commemoration references unknown identity_id "${c.identity_id}"`);
    if (!c.tradition || typeof c.tradition !== "string") die(`ERROR: commemoration missing tradition: ${JSON.stringify(c)}`);
    if (!ALL_TRADITIONS.includes(c.tradition)) die(`ERROR: commemoration has invalid tradition "${c.tradition}"`);
    if (!c.calendar || typeof c.calendar !== "string") die(`ERROR: commemoration missing calendar: ${JSON.stringify(c)}`);
    if (c.calendar !== "gregorian") die(`ERROR: commemoration.calendar must be "gregorian": ${JSON.stringify(c)}`);
    if (!c.date || typeof c.date !== "object") die(`ERROR: commemoration missing date: ${JSON.stringify(c)}`);
    if (typeof c.date.month !== "number" || c.date.month < 1 || c.date.month > 12) die(`ERROR: invalid date.month: ${JSON.stringify(c)}`);
    if (typeof c.date.day !== "number" || c.date.day < 1 || c.date.day > 31) die(`ERROR: invalid date.day: ${JSON.stringify(c)}`);
  }
}

// ── Cache generation ─────────────────────────────────────────────────────────
function generateMonth(monthNum, identityMap, commemorations) {
  // Only gregorian commemorations are eligible for this cache.
  const monthComms = commemorations.filter(
    c => c.calendar === "gregorian" && c.date.month === monthNum
  );

  // Group commemorations by (identity_id, day) to detect ecumenical coverage
  // key: `${identity_id}::${day}`
  const groupMap = new Map();
  for (const comm of monthComms) {
    // Harden against malformed records (even though we validate)
    if (!comm?.date || typeof comm.date.day !== "number") continue;

    const key = `${comm.identity_id}::${comm.date.day}`;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key).push(comm);
  }

  const records = [];

  for (const comms of groupMap.values()) {
    const identityId = comms[0].identity_id;
    const identity = identityMap.get(identityId);
    if (!identity) {
      process.stderr.write(`WARN: no identity for id="${identityId}" (skipping)\n`);
      continue;
    }

    const dayNum = comms[0].date.day;
    const dayStr = `${MONTH_NAMES[monthNum]} ${dayNum}`; // e.g. "March 1"

    const traditionsPresent = new Set(comms.map(c => c.tradition));
    const isEcumenical = ALL_TRADITIONS.every(t => traditionsPresent.has(t));

    const tags = isEcumenical
      ? [...ALL_TRADITIONS]
      : [...traditionsPresent].sort();

    records.push({
      id: identity.id,
      day: dayStr,
      name: identity.name,
      description: identity.description,
      type: identity.type,
      tags,
      // Internal sort aid (removed before write)
      _dayNum: dayNum,
    });
  }

  // Deterministic sort: day asc, then name asc
  records.sort((a, b) => {
    if (a._dayNum !== b._dayNum) return a._dayNum - b._dayNum;
    return a.name.localeCompare(b.name, "en");
  });

  // Strip internal field
  for (const r of records) delete r._dayNum;

  return records;
}

function writeCacheFile(monthNum, records) {
  const monthSlug = MONTH_NAMES[monthNum].toLowerCase();
  const outPath = path.join(ROOT, "data", "saints", `saints-${monthSlug}.json`);
  writeJson(outPath, records);
  process.stdout.write(`wrote ${records.length} records → ${path.relative(ROOT, outPath)}\n`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  // Load
  const identities = loadJson(IDENTITIES_PATH);
  const commemorations = loadJson(COMMEMORATIONS_PATH);

  // Validate inputs (generator-focused)
  validateInputs(identities, commemorations);

  // Build identity lookup
  const identityMap = new Map(identities.map(i => [i.id, i]));

  // Determine which months to generate
  const args = process.argv.slice(2).map(a => a.toLowerCase().trim()).filter(Boolean);

  let monthNums;
  if (args.length === 0) {
    const presentMonths = new Set(
      commemorations
        .filter(c => c.calendar === "gregorian")
        .map(c => c.date.month)
    );
    monthNums = [...presentMonths].sort((a, b) => a - b);
  } else {
    monthNums = args.map(slug => {
      const num = MONTH_SLUGS[slug];
      if (!num) die(`ERROR: unrecognised month "${slug}"`);
      return num;
    });
  }

  for (const monthNum of monthNums) {
    const records = generateMonth(monthNum, identityMap, commemorations);
    writeCacheFile(monthNum, records);
  }
}

main();