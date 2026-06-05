#!/usr/bin/env node
import fs from "node:fs";

const qcPath = "scripts/browser-qc-office-navigation-feature-sweep.js";
const qc = fs.readFileSync(qcPath, "utf8");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

const failures = [];

function requireIncludes(label, text, markers) {
  for (const marker of markers) {
    if (!text.includes(marker)) {
      failures.push(`${label} missing marker: ${marker}`);
    }
  }
}

requireIncludes("office navigation feature sweep runner", qc, [
  "window.runOfficeNavigationFeatureSweep",
  "Daily Office",
  "Ethiopian Sa'atat",
  "Church of the East",
  "Horologion",
  "defaults to today/current office and sidebar open",
  "shared date controls work",
  "hour/office selector changes rendered content"
]);

requireIncludes("office navigation feature sweep selectors", qc, [
  ".shared-office-nav",
  "data-shared-office-nav",
  "settings-panel",
  "ethiopian-settings",
  "east-syriac-settings",
  "generic-settings",
  "shared-office-nav-date-picker",
  "shared-office-nav-actions"
]);

requireIncludes("office navigation feature sweep default assertions", qc, [
  "expectedDailyOffice",
  "expectedEthiopianHour",
  "expectedEastSyriacHour",
  "expectedHorologionOffice",
  "isoDate(0)",
  "sidebar-hidden",
  "mode-hidden",
  "toggleSidebar"
]);

requireIncludes("office navigation feature sweep behavior assertions", qc, [
  "Prev/Next/manual date/Today controls passed",
  "waitForDateAndOfficeContent",
  "changed ${beforeActive} -> ${alternate} and rendered different content",
  "window.__lastOfficeNavigationFeatureSweep",
  "universalOfficeSettings"
]);

if (pkg.scripts?.["audit:office-navigation-feature-sweep-runner"] !== "node scripts/audit-office-navigation-feature-sweep-runner.mjs") {
  failures.push("package.json missing audit:office-navigation-feature-sweep-runner script");
}

if (failures.length) {
  console.error("FAIL office navigation feature sweep runner audit");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("PASS office navigation feature sweep runner audit: browser-runtime office navigation sweep guarded");
