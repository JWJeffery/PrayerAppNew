#!/usr/bin/env node
import fs from "node:fs";

const admin = fs.readFileSync("admin/admin.html", "utf8");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

const failures = [];

function requireIncludes(label, text, markers) {
  for (const marker of markers) {
    if (!text.includes(marker)) {
      failures.push(`${label} missing marker: ${marker}`);
    }
  }
}

requireIncludes("Admin parchment shell HTML", admin, [
  "class=\"admin-app-shell\"",
  "id=\"back-to-modes\"",
  "Admin Dashboard",
  "DEV ONLY",
  "id=\"workspace\"",
  "id=\"sidebar\"",
  "id=\"main\""
]);

requireIncludes("Admin parchment shell CSS", admin, [
  "Admin Dashboard parchment app shell propagation pass",
  "--admin-bg-warm",
  "--admin-surface",
  "--admin-ink",
  ".admin-app-shell #shell",
  ".admin-app-shell #workspace",
  ".admin-app-shell #sidebar",
  ".admin-app-shell .panel",
  ".admin-app-shell .run-btn"
]);

requireIncludes("Admin preserved controls", admin, [
  "id=\"ctrl-year\"",
  "id=\"ctrl-tradition\"",
  "id=\"ctrl-calendar\"",
  "id=\"run-btn\"",
  "id=\"panel-year\"",
  "id=\"panel-day\"",
  "id=\"panel-todos\"",
  "id=\"panel-repo-hygiene\""
]);

if (pkg.scripts?.["audit:admin-design-shell"] !== "node scripts/audit-admin-design-shell.mjs") {
  failures.push("package.json missing audit:admin-design-shell script");
}

if (failures.length) {
  console.error("FAIL Admin design shell audit");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("PASS Admin design shell audit: parchment app shell guarded");
