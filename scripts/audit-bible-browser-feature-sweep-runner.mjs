#!/usr/bin/env node
import fs from "node:fs";

const qcPath = "scripts/browser-qc-bible-browser-feature-sweep.js";
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

requireIncludes("browser feature sweep runner", qc, [
  "window.runBibleFeatureSweep",
  "reload guard: no empty Study Help panel",
  "open passage: Hebrews 1",
  "open passage: Jubilees 1",
  "compare translations toggle",
  "browse by book opens chapter",
  "advanced search returns results",
  "highlight colors render and save",
  "multi-verse highlight stores segments",
  "existing highlight color changes by swatch",
  "add and save note",
  "What the Fathers Say panel loads",
  "Save Fathers card to notebook",
  "Add Fathers card to existing note",
  "Notes and Highlights drawer renders saved items",
  "Reading Plan marks complete",
  "Research Markdown export creates download"
]);

requireIncludes("browser feature sweep selectors", qc, [
  "uo.bibleBrowser.annotations.v1",
  "uo.bibleBrowser.fathersNotebook.v1",
  "uo.bibleBrowser.readingPlan.v1",
  "data-context-highlight-color",
  "data-save-witness-notebook",
  "data-add-witness-note",
  "bible-export-research-markdown"
]);


requireIncludes("browser feature sweep direct passage resolution", qc, [
  "await api.displayCitation({ restoreScroll: false });",
  "passageLooksResolved",
  "bookKey: \"hebrews\", chapters: [2, 3, 4]",
  "await window.UniversalOfficeBibleBrowser.openSelectedBook();"
]);

if (pkg.scripts?.["audit:bible-browser-feature-sweep-runner"] !== "node scripts/audit-bible-browser-feature-sweep-runner.mjs") {
  failures.push("package.json missing audit:bible-browser-feature-sweep-runner script");
}

if (failures.length) {
  console.error("FAIL Bible browser feature sweep runner audit");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("PASS Bible browser feature sweep runner audit: browser-runtime workflow sweep guarded");
