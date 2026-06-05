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

requireIncludes("shared office sidebar CSS", css, [
  "Shared office sidebar normalization pass",
  "--app-sidebar-width",
  "#settings-panel.app-mode-drawer",
  "#ethiopian-settings.app-mode-drawer",
  "#east-syriac-settings.app-mode-drawer",
  "#generic-settings.app-mode-drawer"
]);

requireIncludes("shared office sidebar controls", css, [
  ".app-mode-drawer .ordo-control",
  ".app-mode-drawer .setting-group",
  ".app-mode-drawer input[type=\"date\"]",
  ".app-mode-drawer input[type=\"radio\"]",
  ".app-mode-drawer select",
  ".app-mode-drawer button:not(.app-mode-return)"
]);

requireIncludes("shared office sidebar layout", css, [
  "width: calc(100vw - var(--app-nav-rail-width, 42px) - var(--app-sidebar-width))",
  "scrollbar-color",
  "accent-color",
  "border-radius: 16px"
]);

if (pkg.scripts?.["audit:shared-office-sidebars"] !== "node scripts/audit-shared-office-sidebars.mjs") {
  failures.push("package.json missing audit:shared-office-sidebars script");
}

if (failures.length) {
  console.error("FAIL shared office sidebars audit");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("PASS shared office sidebars audit: uniform office drawer controls guarded");
