#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

// Landmark: COMMEMORATIONS_PATH (same concept as in other tools)
const ROOT = path.resolve(__dirname, "..");
const COMMEMORATIONS_PATH = path.join(ROOT, "data", "saints", "commemorations.json");

const comms = JSON.parse(fs.readFileSync(COMMEMORATIONS_PATH, "utf8"));
if (!Array.isArray(comms)) {
  console.error("ERROR: commemorations.json must be an array");
  process.exit(1);
}

let changed = 0;
for (const c of comms) {
  if (!c || typeof c !== "object") continue;

  // Validator wants ONLY "gregorian" for now.
  if (c.calendar !== "gregorian") {
    c.calendar = "gregorian";
    changed++;
  }
}

fs.writeFileSync(COMMEMORATIONS_PATH, JSON.stringify(comms, null, 2) + "\n", "utf8");
console.log(`fixed ${changed} commemorations → calendar="gregorian"`);