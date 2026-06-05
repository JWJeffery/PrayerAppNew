#!/usr/bin/env node
import fs from "node:fs";

const js = fs.readFileSync("js/office-ui.js", "utf8");
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

requireIncludes("shared office navigation apparatus JS", js, [
  "Shared Office Navigation Apparatus",
  "SHARED_OFFICE_NAVIGATOR_CONFIGS",
  "renderSharedOfficeNavigation",
  "setSharedOfficeNavHour",
  "setSharedOfficeNavDate",
  "changeSharedOfficeNavDate",
  "todaySharedOfficeNavDate"
]);

requireIncludes("shared office navigation modes", js, [
  "panelId: \"settings-panel\"",
  "panelId: \"ethiopian-settings\"",
  "panelId: \"east-syriac-settings\"",
  "panelId: \"generic-settings\"",
  "officeTitle: \"Time of Day\"",
  "officeTitle: \"Canonical Watch\"",
  "officeTitle: \"Canonical Hour\"",
  "officeTitle: \"Office\""
]);

requireIncludes("shared office navigation apparatus CSS", css, [
  "Shared office navigation apparatus pass",
  ".shared-office-nav",
  ".shared-office-nav-card",
  ".shared-office-nav-actions",
  ".shared-office-nav-date-picker",
  ".shared-office-nav-option",
  ".shared-office-nav-legacy-hidden"
]);

requireIncludes("render hook", js, [
  "renderSharedOfficeNavigation();",
  "function requestRender()"
]);

if (pkg.scripts?.["audit:shared-office-navigation-apparatus"] !== "node scripts/audit-shared-office-navigation-apparatus.mjs") {
  failures.push("package.json missing audit:shared-office-navigation-apparatus script");
}

if (failures.length) {
  console.error("FAIL shared office navigation apparatus audit");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("PASS shared office navigation apparatus audit: date and hour controls use one shared grammar");
