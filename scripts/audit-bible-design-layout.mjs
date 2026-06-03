import fs from "node:fs";

const index = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("css/bible-browser.css", "utf8");
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
  "Bible Reader & Study",
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


if (!index.includes("Cormorant+Garamond")) {
  fail("Bible Browser typography pass is missing Cormorant Garamond font import.");
}

if (!index.includes("Source+Serif+4")) {
  fail("Bible Browser typography pass is missing Source Serif 4 font import.");
}

if (!css.includes("Parchment typography Bible Browser pass")) {
  fail("Bible Browser CSS is missing parchment typography pass marker.");
}

if (!css.includes("--bible-font-display")) {
  fail("Bible Browser CSS is missing display font variable.");
}

if (!css.includes("--bible-font-body")) {
  fail("Bible Browser CSS is missing body font variable.");
}

if (failures.length) {
  console.error("FAIL Bible design layout audit");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("PASS Bible design layout audit: static reader-first layout markers guarded");
