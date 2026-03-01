#!/usr/bin/env node
/**
 * build_saints_cache.js
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
 *   - Each generated record's `tags` array includes the tradition code for that commemoration.
 *   - When a single identity has commemorations in ALL five traditions on the same date,
 *     the generated record receives the full five-code set ["ANG","LAT","EOR","OOR","COE"]
 *     so the runtime UI derives the ECU (ecumenical) display label without code changes.
 */

"use strict";

const fs   = require("fs");
const path = require("path");

// ── Month helpers ────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  "", // 1-indexed
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const MONTH_SLUGS = {
  "january":1,"february":2,"march":3,"april":4,"may":5,"june":6,
  "july":7,"august":8,"september":9,"october":10,"november":11,"december":12
};

const ALL_TRADITIONS = new Set(["ANG","LAT","EOR","OOR","COE"]);

// ── Paths (relative to project root) ────────────────────────────────────────
const ROOT = path.resolve(__dirname, "..");
const IDENTITIES_PATH    = path.join(ROOT, "data", "saints", "identities.json");
const COMMEMORATIONS_PATH = path.join(ROOT, "data", "saints", "commemorations.json");

// ── Load source files ────────────────────────────────────────────────────────
function load(p) {
  const text = fs.readFileSync(p, "utf8");
  return JSON.parse(text);
}

// ── Generate cache for a single month number (1–12) ─────────────────────────
function generateMonth(monthNum, identityMap, commemorations) {
  const monthComms = commemorations.filter(c => c.date.month === monthNum);

  // Group commemorations by (identity_id, day) to detect ecumenical coverage
  // key: `${identity_id}::${day}`
  const groupMap = new Map();
  for (const comm of monthComms) {
    const key = `${comm.identity_id}::${comm.date.day}`;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key).push(comm);
  }

  // Build output records.  One record per (identity_id, day) group.
  const records = [];
  for (const [key, comms] of groupMap.entries()) {
    const identity = identityMap.get(comms[0].identity_id);
    if (!identity) {
      process.stderr.write(`WARN: no identity for id="${comms[0].identity_id}"\n`);
      continue;
    }

    const dayNum   = comms[0].date.day;
    const dayStr   = `${MONTH_NAMES[monthNum]} ${dayNum}`;   // e.g. "March 1"
    const traditions = new Set(comms.map(c => c.tradition));

    // Ecumenical: all five traditions present on this date for this identity
    let tags;
    if (traditions.size === ALL_TRADITIONS.size &&
        [...ALL_TRADITIONS].every(t => traditions.has(t))) {
      tags = ["ANG","LAT","EOR","OOR","COE"];
    } else {
      tags = [...traditions].sort();
    }

    records.push({
      id:          identity.id,
      day:         dayStr,
      name:        identity.name,
      description: identity.description,
      type:        identity.type,
      tags,
    });
  }

  // Sort: day numeric asc, then name asc (deterministic)
  records.sort((a, b) => {
    const da = parseInt(a.day.split(" ")[1], 10);
    const db = parseInt(b.day.split(" ")[1], 10);
    if (da !== db) return da - db;
    return a.name.localeCompare(b.name, "en");
  });

  return records;
}

// ── Write a cache file ───────────────────────────────────────────────────────
function writeCacheFile(monthNum, records) {
  const monthSlug = MONTH_NAMES[monthNum].toLowerCase();
  const outPath   = path.join(ROOT, "data", "saints", `saints-${monthSlug}.json`);
  fs.writeFileSync(outPath, JSON.stringify(records, null, 2) + "\n", "utf8");
  process.stdout.write(`wrote ${records.length} records → ${path.relative(ROOT, outPath)}\n`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  const identities     = load(IDENTITIES_PATH);
  const commemorations = load(COMMEMORATIONS_PATH);

  // Build identity lookup map
  const identityMap = new Map(identities.map(i => [i.id, i]));

  // Determine which months to generate
  let monthNums;
  const args = process.argv.slice(2).map(a => a.toLowerCase().trim());

  if (args.length === 0) {
    // Generate all months that appear in commemorations
    const presentMonths = new Set(commemorations.map(c => c.date.month));
    monthNums = [...presentMonths].sort((a, b) => a - b);
  } else {
    monthNums = args.map(slug => {
      const num = MONTH_SLUGS[slug];
      if (!num) {
        process.stderr.write(`ERROR: unrecognised month "${slug}"\n`);
        process.exit(1);
      }
      return num;
    });
  }

  for (const monthNum of monthNums) {
    const records = generateMonth(monthNum, identityMap, commemorations);
    writeCacheFile(monthNum, records);
  }
}

main();