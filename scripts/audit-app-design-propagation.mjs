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

requireIncludes("mode selection app shell", index, [
  "app-mode-shell",
  "app-mode-grid",
  "app-mode-card",
  "Bible Reader",
  "Musings, Ancient and Modern"
]);

requireIncludes("app-wide parchment design CSS", css, [
  "App-wide parchment design propagation pass",
  "--app-bg-warm",
  "--app-surface",
  "--app-ink",
  "#mode-selection.app-mode-shell",
  ".app-mode-card",
  ".app-sponsor-link"
]);

if (!index.includes("onclick=\"selectMode('daily')\"")) {
  failures.push("Daily Office mode action was not preserved");
}

if (!index.includes("onclick=\"openBibleBrowser()\"")) {
  failures.push("Bible Reader mode action was not preserved");
}

if (!index.includes("window.location.href='admin/admin.html'")) {
  failures.push("Admin Dashboard mode action was not preserved");
}

if (pkg.scripts?.["audit:app-design-propagation"] !== "node scripts/audit-app-design-propagation.mjs") {
  failures.push("package.json missing audit:app-design-propagation script");
}

if (failures.length) {
  console.error("FAIL app design propagation audit");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("PASS app design propagation audit: parchment app shell mode selector guarded");
