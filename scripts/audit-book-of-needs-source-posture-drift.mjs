#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const roots = ["documentation"];
const fileNamePattern = /book-of-needs/i;
const scannedExtensions = new Set([".json", ".md", ".txt"]);

const blockedPatterns = [
  {
    pattern: /needs[- ]permission[- ]review/i,
    reason: "Use lightweight source review language, not permission-review framing."
  },
  {
    pattern: /\bdo not import\b/i,
    reason: "Do not encode broad internal-corpus import blockers in governance docs."
  },
  {
    pattern: /not import permission/i,
    reason: "Do not treat source leads as import-permission blockers."
  },
  {
    pattern: /not redistribution permission/i,
    reason: "Do not turn source inventory into redistribution-rights schema."
  },
  {
    pattern: /sourceLeadDoesNotAuthorizeImport/i,
    reason: "Use sourceLeadDoesNotCreatePrayerEntry instead."
  },
  {
    pattern: /\brightsPosture\b/,
    reason: "Use sourcePosture instead of rights schema fields."
  },
  {
    pattern: /\bpublicDomainPermissionStatus\b/,
    reason: "Use publicRenderingPosture instead of rights schema fields."
  },
  {
    pattern: /\bpermissionRecordId\b/,
    reason: "Use compact sourceId/source record linkage instead of permission-record schema."
  },
  {
    pattern: /current terms block/i,
    reason: "Do not let one website's posture become a general corpus blocker."
  },
  {
    pattern: /permission anxiety/i,
    reason: "Do not preserve permission-anxiety framing in governance docs."
  }
];

const failures = [];
const scannedFiles = [];

function walk(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (!fileNamePattern.test(entry.name)) {
      continue;
    }

    if (!scannedExtensions.has(path.extname(entry.name).toLowerCase())) {
      continue;
    }

    scannedFiles.push(fullPath);

    const text = fs.readFileSync(fullPath, "utf8");
    const lines = text.split(/\r?\n/);

    for (const [index, line] of lines.entries()) {
      for (const blocked of blockedPatterns) {
        if (blocked.pattern.test(line)) {
          failures.push(`${fullPath}:${index + 1}: ${blocked.reason} :: ${line.trim()}`);
        }
      }
    }

    if (fullPath.endsWith(".json")) {
      try {
        JSON.parse(text);
      } catch (error) {
        failures.push(`${fullPath}: invalid JSON: ${error.message}`);
      }
    }
  }
}

for (const root of roots) {
  walk(root);
}

if (scannedFiles.length === 0) {
  failures.push("No Book of Needs governance documentation files were scanned.");
}

if (failures.length) {
  console.error("FAIL Book of Needs source posture drift audit");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log(`PASS Book of Needs source posture drift audit: files=${scannedFiles.length} checks=${blockedPatterns.length}`);
