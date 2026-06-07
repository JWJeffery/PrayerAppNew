#!/usr/bin/env node
import fs from "node:fs";

const qcPath = "scripts/browser-qc-user-profile-defaults-sweep.js";
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

requireIncludes("user profile browser QC runner core", qc, [
  "window.runUserProfileDefaultsSweep",
  "window.__lastUserProfileDefaultsSweep",
  "[Profile QC]",
  "backupLocalStorage",
  "restoreLocalStorage",
  "universalOffice.userProfile.v1",
  "universalOffice.entry.default.v1"
]);

requireIncludes("user profile browser QC guards controls and API", qc, [
  "getUniversalOfficeUserProfile",
  "setUserProfileEntryPageDefault",
  "setUserProfileTraditionDefault",
  "setUserProfileBookOfNeedsScope",
  "resetUniversalOfficeUserProfile",
  "#user-profile-defaults",
  "#profile-entry-default",
  "#profile-tradition-default",
  "#profile-book-needs-scope"
]);

requireIncludes("user profile browser QC guards office-page access", qc, [
  "Office Defaults action opens local defaults panel",
  "verifyOfficeDefaultsActionOpensPanel",
  "#office-profile-defaults-button",
  "openLocalProfileDefaultsFromOffice",
  "#user-profile-defaults",
  "#profile-entry-default",
  "Defaults for this browser"
]);

requireIncludes("user profile browser QC guards defaults", qc, [
  "Universal selector default persists",
  "Tradition office default persists",
  "eastern-orthodox",
  "entryPageDefault === \"universal\"",
  "entryPageDefault === \"tradition\"",
  "traditionDefault === \"eastern-orthodox\""
]);

requireIncludes("user profile browser QC guards Book of Needs profile scopes", qc, [
  "Book of Needs all-prayers profile override works",
  "Book of Needs tradition-filtered scope still works",
  "setUserProfileBookOfNeedsScope(\"universal\")",
  "setUserProfileBookOfNeedsScope(\"tradition\")",
  "openOfficeBookOfNeeds(\"daily\", \"The Episcopal Church\", \"UNIVERSAL\")",
  "openOfficeBookOfNeeds(\"daily\", \"The Episcopal Church\", \"ANG\")",
  "waitForBookOfNeedsContext(expectedContext)",
  "minister-journey-orthodox",
  "thanksgiving-aquinas",
  "prayer-humble-access"
]);

requireIncludes("user profile browser QC guards reset", qc, [
  "Profile reset clears local defaults",
  "localStorage.getItem(PROFILE_KEY) === null",
  "localStorage.getItem(LEGACY_ENTRY_KEY) === null",
  "bookOfNeedsScope === \"tradition\""
]);

if (pkg.scripts?.["audit:user-profile-browser-qc-runner"] !== "node scripts/audit-user-profile-browser-qc-runner.mjs") {
  failures.push("package.json missing audit:user-profile-browser-qc-runner script");
}

if (failures.length) {
  console.error("FAIL user profile browser QC runner audit");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("PASS user profile browser QC runner audit: browser-runtime profile defaults sweep guarded");
