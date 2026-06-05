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


if (!css.includes("Bible Reader tool hierarchy pass")) {
  fail("Bible Reader tool hierarchy CSS marker is missing.");
}

if (!css.includes(':has(#bible-parallel-toggle:checked)')) {
  fail("Second translation selector should be visually gated behind compare toggle.");
}

if (!css.includes(".bible-passage-summary")) {
  fail("Bible Reader tool hierarchy pass should include compact passage-summary styling.");
}


if (!css.includes("Bible Reader canvas polish pass")) {
  fail("Bible Reader canvas polish CSS marker is missing.");
}

if (!css.includes("max-width: 860px")) {
  fail("Bible Reader canvas should have a book-like reading measure.");
}

if (!css.includes(".bible-highlight-yellow")) {
  fail("Bible Reader canvas polish should preserve softened highlight styling.");
}

if (!css.includes(".bible-segment-label")) {
  fail("Bible Reader canvas polish should refine passage/chapter chip treatment.");
}


if (!css.includes("Bible Reader command and summary refinement pass")) {
  fail("Bible Reader command/summary refinement CSS marker is missing.");
}

if (!css.includes("grid-template-columns: repeat(5, minmax(120px, 1fr))")) {
  fail("Bible Reader tools should be compressed into a compact tool row.");
}

if (!css.includes(".bible-secondary-intro p")) {
  fail("Bible Reader helper text should be visually reduced.");
}

if (!css.includes("opacity: 0.74")) {
  fail("Bible Reader passage summary should be visually quiet.");
}


if (!index.includes("data-highlight-color=\"yellow\"")) {
  fail("Selection toolbar should expose visual highlight color swatches.");
}

if (!browser.includes("renderHighlightColorSwatches")) {
  fail("Bible Browser JS should render visual highlight color swatches.");
}

if (!browser.includes("data-context-highlight-color")) {
  fail("Context panel should expose visual highlight color swatches.");
}

if (!css.includes("Bible Reader visual highlight color picker")) {
  fail("Bible Reader visual highlight color picker CSS marker is missing.");
}

if (!css.includes(".bible-highlight-swatch-blue")) {
  fail("Visual highlighter swatches should include blue.");
}


if (!css.includes("Bible Reader reduce pre-Scripture whitespace pass")) {
  fail("Bible Reader pre-Scripture whitespace reduction CSS marker is missing.");
}

if (!css.includes(".bible-passage-summary")) {
  fail("Bible Reader whitespace pass should address the passage summary area.");
}

if (!css.includes("display: none !important")) {
  fail("Bible Reader passage summary should not occupy visual space before Scripture.");
}

if (!css.includes(".bible-reading-stage")) {
  fail("Bible Reader whitespace pass should tighten the reading stage.");
}


if (!css.includes("Bible Reader typography correction pass")) {
  fail("Bible Reader typography correction CSS marker is missing.");
}

if (!css.includes("--bible-display-font")) {
  fail("Bible Reader typography correction should define a display font token.");
}

if (!css.includes("text-transform: none")) {
  fail("Bible Reader typography correction should remove forced ceremonial uppercase where needed.");
}

if (!css.includes("--bible-reader-font")) {
  fail("Bible Reader typography correction should define a reader font token.");
}

if (failures.length) {
  console.error("FAIL Bible design layout audit");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("PASS Bible design layout audit: static reader-first layout markers guarded");
