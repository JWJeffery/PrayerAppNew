import fs from "node:fs";

const index = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("css/bible-browser.css", "utf8");
const browser = fs.readFileSync("js/bible-browser/bible-browser.js", "utf8");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

const failures = [];

function fail(message) {
  failures.push(message);
}

function requireMarker(label, haystack, marker) {
  if (!haystack.includes(marker)) {
    fail(`${label} missing marker: ${marker}`);
  }
}

if (!packageJson.scripts?.["audit:bible-design-layout"]) {
  fail("package.json is missing audit:bible-design-layout script.");
}

[
  "bible-design-shell",
  "Bible Reader",
  "bible-design-hero",
  "bible-design-command-surface",
  "bible-command-bar",
  "bible-secondary-intro",
  "bible-tool-dock",
  "bible-reading-stage",
  "bible-reading-canvas"
].forEach(marker => requireMarker("index.html design layout", index, marker));

[
  "id=\"bible-translation-select\"",
  "id=\"bible-reference-input\"",
  "id=\"bible-reference-go\"",
  "id=\"bible-parallel-toggle\"",
  "id=\"bible-search-input\"",
  "id=\"bible-plan-toggle-complete\"",
  "id=\"bible-research-index\"",
  "id=\"bible-highlight-color\"",
  "id=\"bible-context-panel\""
].forEach(marker => requireMarker("preserved Bible control", index, marker));

[
  "Design-forward Bible Browser static layout pass",
  ".bible-design-shell",
  ".bible-design-hero",
  ".bible-design-command-surface",
  ".bible-tool-dock",
  ".bible-reading-stage",
  ".bible-reading-canvas",
  "Parchment concept Bible Browser visual pass",
  "illuminated parchment",
  "#fbf5ea",
  "#5a2f12",
  ".bible-context-panel-study"
].forEach(marker => requireMarker("css design layout", css, marker));

if (index.includes("<h1>Scripture Browser</h1>")) {
  fail("Bible Browser visible h1 should use the new design-forward title.");
}



if (!index.includes("<h1>Bible Reader</h1>")) {
  fail("Bible Reader composition pass should use compact Bible Reader title.");
}

if (!index.includes("Open tools only when needed.")) {
  fail("Bible Reader composition pass should use compact study-tools helper text.");
}

if (!css.includes("Bible Reader app composition pass")) {
  fail("Bible Reader composition CSS marker is missing.");
}

if (!browser.includes("viewportHeight * 0.16")) {
  fail("Study drawer should be positioned below the top command area.");
}

if (failures.length) {
  console.error("FAIL Bible design layout audit");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("PASS Bible design layout audit: static reader-first layout markers guarded");
