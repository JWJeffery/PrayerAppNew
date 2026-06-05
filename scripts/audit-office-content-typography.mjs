#!/usr/bin/env node
import fs from "node:fs";

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

requireIncludes("shared office content typography CSS", css, [
  "Shared office content typography sobriety pass",
  "body.office-active .office-container .component-text",
  "body.office-active .office-container .reading-text",
  "body.office-active .office-container .psalm-stanza",
  "body.office-active .office-container .rubric-text",
  "body.office-active .office-container .passage-reference"
]);

requireIncludes("global drop cap suppression", css, [
  "Disable the old global automatic drop cap",
  "body.office-active .office-container .component-text::first-letter",
  "float: none",
  "font-size: inherit",
  "text-shadow: none"
]);

requireIncludes("shared reading rhythm", css, [
  "font-size: clamp(1.02rem, 1.12vw, 1.18rem)",
  "line-height: 1.72",
  "text-align: left",
  "hyphens: manual"
]);

if (pkg.scripts?.["audit:office-content-typography"] !== "node scripts/audit-office-content-typography.mjs") {
  failures.push("package.json missing audit:office-content-typography script");
}

if (failures.length) {
  console.error("FAIL office content typography audit");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("PASS office content typography audit: sober shared prayer text rhythm guarded");
