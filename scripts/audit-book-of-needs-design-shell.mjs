#!/usr/bin/env node
import fs from "node:fs";

const index = fs.readFileSync("index.html", "utf8");
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

requireIncludes("Book of Needs shell HTML", index, [
  "app-book-needs-shell",
  "app-book-needs-selection",
  "app-book-needs-title",
  "app-book-needs-actions",
  "app-book-needs-display",
  "app-book-needs-back-bar"
]);

requireIncludes("Book of Needs shell CSS", css, [
  "Book of Needs parchment app shell propagation pass",
  "#individual-prayers-section.app-book-needs-shell",
  "#prayer-selection.app-book-needs-selection",
  ".app-book-needs-title",
  ".app-book-needs-actions",
  "#prayer-display.app-book-needs-display",
  "#prayer-back-bar.app-book-needs-back-bar"
]);

requireIncludes("Book of Needs preserved actions", index, [
  "onclick=\"showSinglePrayer()\"",
  "onclick=\"backFromBookOfNeeds()\"",
  "onclick=\"backToPrayerDropdown()\"",
  "id=\"prayer-dropdown\"",
  "id=\"book-needs-context-label\"",
  "id=\"book-needs-scope-note\"",
  "id=\"book-needs-return-button\""
]);

if (pkg.scripts?.["audit:book-of-needs-design-shell"] !== "node scripts/audit-book-of-needs-design-shell.mjs") {
  failures.push("package.json missing audit:book-of-needs-design-shell script");
}

if (failures.length) {
  console.error("FAIL Book of Needs design shell audit");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("PASS Book of Needs design shell audit: parchment app shell guarded");
