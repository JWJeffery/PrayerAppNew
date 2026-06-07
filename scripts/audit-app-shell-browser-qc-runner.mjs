#!/usr/bin/env node
import fs from "node:fs";

const runnerPath = "scripts/browser-qc-app-shell-sweep.js";
const runner = fs.readFileSync(runnerPath, "utf8");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

const failures = [];

function requireIncludes(label, text, markers) {
  for (const marker of markers) {
    if (!text.includes(marker)) {
      failures.push(`${label} missing marker: ${marker}`);
    }
  }
}

requireIncludes("app-shell browser QC runner core", runner, [
  "window.runAppShellBrowserQc",
  "window.__lastAppShellBrowserQc",
  "[App Shell QC]",
  "runExternalSweep",
  "waitForSweepResult",
  "loadBrowserSweepScript",
  "SWEEP_TIMEOUT_MS"
]);

requireIncludes("app-shell browser QC chains existing sweeps", runner, [
  "/scripts/browser-qc-office-navigation-feature-sweep.js",
  "__lastOfficeNavigationFeatureSweep",
  "Office navigation browser sweep",
  "/scripts/browser-qc-book-of-needs-routing-sweep.js",
  "__lastBookOfNeedsRoutingSweep",
  "Book of Needs browser routing sweep"
]);

requireIncludes("app-shell browser QC guards commemorations", runner, [
  "verifyCommemorationScopeAndReadability",
  "Daily Office commemoration normalizer verified; Horologion commemoration hidden and cleared",
  "normalizeCommemorationCardReadability",
  "ANGSaint App Shell Sentinel",
  "ANG Saint App Shell Sentinel",
  "app-commemoration-card",
  "window.selectMode(\"daily\")",
  "window.selectMode(\"horologion\")",
  "waitForOfficeTextReady",
  "Horologion should not visibly show the Anglican commemoration section",
  "Horologion should clear stale Anglican commemoration content"
]);

requireIncludes("app-shell browser QC reports table and pass/fail", runner, [
  "console.table(results)",
  "[App Shell QC] PASS",
  "[App Shell QC] FAIL",
  "passed: failed.length === 0"
]);

if (pkg.scripts?.["audit:app-shell-browser-qc-runner"] !== "node scripts/audit-app-shell-browser-qc-runner.mjs") {
  failures.push("package.json missing audit:app-shell-browser-qc-runner script");
}

if (failures.length) {
  console.error("FAIL app-shell browser QC runner audit");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("PASS app-shell browser QC runner audit: app-wide browser-runtime sweep guarded");
