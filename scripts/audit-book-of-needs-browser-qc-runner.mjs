#!/usr/bin/env node
import fs from "node:fs";

const qcPath = "scripts/browser-qc-book-of-needs-routing-sweep.js";
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

requireIncludes("Book of Needs browser QC runner", qc, [
  "window.runBookOfNeedsRoutingSweep",
  "window.__lastBookOfNeedsRoutingSweep",
  "[Book Needs QC]",
  "openUniversalBookOfNeeds",
  "openBookOfNeedsForActiveOffice",
  "backFromBookOfNeeds",
  "Universal selector: Book of Needs shows all prayers and Back returns to selector",
  "Daily Office: Book of Needs filters Anglican/Episcopal and Back returns to office",
  "Horologion: Book of Needs filters Eastern Orthodox and Back returns to office"
]);

requireIncludes("Book of Needs context selectors", qc, [
  "#individual-prayers-section",
  "#book-needs-context-label",
  "#book-needs-scope-note",
  "#book-needs-return-button",
  "#prayer-select-list",
  ".prayer-option",
  "dataset.activeTradition",
  "visiblePrayerCount"
]);

requireIncludes("Book of Needs strict-filter assertions", qc, [
  "prayer-humble-access",
  "minister-journey-orthodox",
  "vesting-orthodox-full",
  "thanksgiving-aquinas",
  "isPrayerOptionVisible",
  "isPrayerOptionHidden",
  "UNIVERSAL",
  "ANG",
  "EO"
]);

requireIncludes("Book of Needs return assertions", qc, [
  "Back to Modes",
  "Back to Office",
  "clickBookNeedsBackAndWaitForOffice",
  "The Episcopal Church",
  "Eastern Orthodoxy",
  "!document.body.classList.contains(\"office-active\")"
]);

if (pkg.scripts?.["audit:book-of-needs-browser-qc-runner"] !== "node scripts/audit-book-of-needs-browser-qc-runner.mjs") {
  failures.push("package.json missing audit:book-of-needs-browser-qc-runner script");
}

if (failures.length) {
  console.error("FAIL Book of Needs browser QC runner audit");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("PASS Book of Needs browser QC runner audit: browser-runtime Book of Needs routing sweep guarded");
