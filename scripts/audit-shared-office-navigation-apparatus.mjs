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

function sliceBetween(label, start, end) {
  const a = js.indexOf(start);
  const b = js.indexOf(end, a + start.length);
  if (a < 0 || b < 0) {
    failures.push(`could not slice ${label}`);
    return "";
  }
  return js.slice(a, b);
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

requireIncludes("current date and current hour defaults", js, [
  "Current Date / Current Hour Defaults",
  "function _defaultDailyOfficeForCurrentTime",
  "function _defaultHorologionOfficeForCurrentTime",
  "function initializeOfficeDefaultsForCurrentDateTime",
  "currentDate = now",
  "window._temporalOverride = { active: false, date: null, hourId: null }",
  "window._esyTemporalOverride = { active: false, date: null, hourId: null }"
]);

requireIncludes("mode-entry default initialization", js, [
  "initializeOfficeDefaultsForCurrentDateTime('daily')",
  "initializeOfficeDefaultsForCurrentDateTime('ethiopian')",
  "initializeOfficeDefaultsForCurrentDateTime('eastSyriac')",
  "initializeOfficeDefaultsForCurrentDateTime('horologion')"
]);

requireIncludes("loading-date fallback", js, [
  "function _sharedOfficeNavigatorCleanLine",
  "/^loading/i.test(text)"
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

const ethBranch = sliceBetween("Ethiopian branch", "} else if (mode === 'ethiopian-saatat')", "} else if (mode === 'east-syriac')");
if (ethBranch) {
  if (!ethBranch.includes("ethSettings.classList.remove('sidebar-hidden')")) {
    failures.push("Ethiopian sidebar must default open");
  }
  if (!ethBranch.includes("mainContent.classList.remove('sidebar-hidden')")) {
    failures.push("Ethiopian main content must default to open-sidebar layout");
  }
}

const esyBranch = sliceBetween("East Syriac branch", "} else if (mode === 'east-syriac')", "} else if (mode === 'horologion')");
if (esyBranch && !esyBranch.includes("esySettings.classList.remove('sidebar-hidden')")) {
  failures.push("East Syriac sidebar must default open");
}

const horBranch = sliceBetween("Horologion branch", "} else if (mode === 'horologion')", "} else {\n        // ── Daily Office");
if (horBranch && !horBranch.includes("genSettings.classList.remove('sidebar-hidden')")) {
  failures.push("Horologion sidebar must default open");
}

const dailyBranch = sliceBetween("Daily branch", "} else {\n        // ── Daily Office", "\n    }\n}");
if (dailyBranch && !dailyBranch.includes("settingsPanel.classList.remove('sidebar-hidden')")) {
  failures.push("Daily Office sidebar must default open");
}

if (pkg.scripts?.["audit:shared-office-navigation-apparatus"] !== "node scripts/audit-shared-office-navigation-apparatus.mjs") {
  failures.push("package.json missing audit:shared-office-navigation-apparatus script");
}

if (failures.length) {
  console.error("FAIL shared office navigation apparatus audit");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("PASS shared office navigation apparatus audit: current date, current hour, and open sidebars guarded");
