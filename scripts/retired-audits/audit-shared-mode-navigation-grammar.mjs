#!/usr/bin/env node
import fs from "node:fs";

const index = fs.readFileSync("index.html", "utf8");
const admin = fs.readFileSync("admin/admin.html", "utf8");
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

requireIncludes("shared navigation markers in office app", index, [
  "app-office-mode-shell",
  "app-nav-rail-toggle",
  "app-mode-drawer-daily",
  "app-mode-drawer-ethiopian",
  "app-mode-drawer-east-syriac",
  "app-mode-drawer-horologion",
  "app-primary-canvas",
  "app-mode-return"
]);

requireIncludes("shared navigation markers in admin", admin, [
  "app-mode-return",
  "app-mode-workspace",
  "app-mode-drawer-admin",
  "app-primary-canvas-admin"
]);

requireIncludes("shared navigation grammar CSS", css, [
  "Shared mode navigation grammar propagation pass",
  ".app-mode-return",
  ".app-nav-rail-toggle",
  ".app-mode-drawer",
  ".app-primary-canvas",
  ".app-mode-workspace"
]);

requireIncludes("preserved navigation actions", index, [
  "onclick=\"toggleSidebar()\"",
  "onclick=\"backToSplash()\"",
  "onclick=\"selectMode('daily')\"",
  "onclick=\"selectMode('ethiopian-saatat')\"",
  "onclick=\"selectMode('east-syriac')\"",
  "onclick=\"selectMode('horologion')\""
]);

requireIncludes("preserved admin navigation action", admin, [
  "onclick=\"window.location.href='../index.html'\""
]);

if (pkg.scripts?.["audit:shared-mode-navigation-grammar"] !== "node scripts/audit-shared-mode-navigation-grammar.mjs") {
  failures.push("package.json missing audit:shared-mode-navigation-grammar script");
}

if (failures.length) {
  console.error("FAIL shared mode navigation grammar audit");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("PASS shared mode navigation grammar audit: return action, rail, drawer, and canvas markers guarded");
