#!/usr/bin/env node
import fs from "node:fs";

const doc = fs.readFileSync("documentation/universal-office-navigation-architecture.md", "utf8");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

const failures = [];

function requireIncludes(label, text, markers) {
  for (const marker of markers) {
    if (!text.includes(marker)) {
      failures.push(`${label} missing marker: ${marker}`);
    }
  }
}

requireIncludes("navigation architecture document", doc, [
  "Universal Office Navigation Architecture",
  "canonical app-wide design direction",
  "same high-level structure",
  "Back to Modes",
  "Left navigation rail and settings drawer",
  "Primary content canvas",
  "Shared visual language"
]);

requireIncludes("required mode parity", doc, [
  "Daily Office",
  "Ethiopian Sa'atat",
  "Church of the East",
  "Horologion",
  "Bible Reader",
  "Book of Needs",
  "Admin Dashboard"
]);

requireIncludes("implementation sequence", doc, [
  "Propagate parchment shell to Book of Needs",
  "Propagate parchment shell to Admin Dashboard",
  "Unify office sidebars into a common drawer grammar",
  "Normalize mode return actions",
  "Normalize mode-level headers and primary canvases"
]);

if (pkg.scripts?.["audit:app-navigation-architecture"] !== "node scripts/audit-app-navigation-architecture.mjs") {
  failures.push("package.json missing audit:app-navigation-architecture script");
}

if (failures.length) {
  console.error("FAIL app navigation architecture audit");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("PASS app navigation architecture audit: shared mode navigation contract guarded");
