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

requireIncludes("daily office parchment shell", css, [
  "Daily Office parchment app shell propagation pass",
  "body.office-active #daily-office-section",
  "body.office-active #main-content",
  "body.office-active .office-container",
  "body.office-active #settings-panel",
  "body.office-active #sidebar-toggle"
]);

requireIncludes("daily office shell token alignment", css, [
  "var(--app-ink",
  "var(--app-bronze",
  "var(--app-rubric",
  "rgba(255, 253, 248"
]);

requireIncludes("daily office shell controls", css, [
  "body.office-active .ordo-btn",
  "body.office-active select",
  "body.office-active input[type=\"date\"]",
  "accent-color"
]);

if (pkg.scripts?.["audit:daily-office-design-shell"] !== "node scripts/audit-daily-office-design-shell.mjs") {
  failures.push("package.json missing audit:daily-office-design-shell script");
}

if (failures.length) {
  console.error("FAIL daily office design shell audit");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("PASS daily office design shell audit: parchment app shell guarded");
