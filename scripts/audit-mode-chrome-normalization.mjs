#!/usr/bin/env node
import fs from "node:fs";

const css = fs.readFileSync("css/office.css", "utf8");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

const failures = [];

function requireIncludes(label, text, markers) {
  for (const marker of markers) {
    if (!text.includes(marker)) {
      failures.push(`${label} missing marker: ${marker}`);
    }
  }
}

requireIncludes("shared mode chrome CSS", css, [
  "Shared mode chrome normalization pass",
  "body.office-active #back-to-modes",
  "body.office-active #main-content.app-primary-canvas > h1",
  "body.office-active .office-container",
  "body.office-active .app-mode-drawer",
  "body.office-active .app-nav-rail-toggle"
]);

requireIncludes("shared mode chrome readability", css, [
  "linear-gradient(180deg, #7a3f17, #5d2f11)",
  "color: #fff8ec",
  "z-index: 420",
  "width: min(100%, 860px)"
]);

if (pkg.scripts?.["audit:mode-chrome-normalization"] !== "node scripts/audit-mode-chrome-normalization.mjs") {
  failures.push("package.json missing audit:mode-chrome-normalization script");
}

if (failures.length) {
  console.error("FAIL mode chrome normalization audit");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("PASS mode chrome normalization audit: return action, headers, drawers, and canvas sizing guarded");
