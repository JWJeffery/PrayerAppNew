import fs from "node:fs";

const doc = fs.readFileSync("documentation/universal-office-visual-design-refactor-brief.md", "utf8");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

const failures = [];

function fail(message) {
  failures.push(message);
}

function requireText(text) {
  if (!doc.includes(text)) fail(`Missing design-brief marker: ${text}`);
}

if (!packageJson.scripts?.["audit:visual-design-brief"]) {
  fail("package.json is missing audit:visual-design-brief script.");
}

[
  "The Bible Browser is the pilot implementation.",
  "Beauty serves structure. Structure governs beauty.",
  "Visual unity must not flatten canonical or liturgical distinctions.",
  "The ordinary user should see plain-English labels first.",
  "illuminated parchment interface",
  "Dark mode may eventually exist as an optional secondary mode",
  "The target reference is the mobile-app concept",
  "cream / parchment study drawer",
  "Phase B: redesign the Bible Browser static layout around the parchment/mobile-app concept",
  "location.href = \"/tools/bible?reload=\" + Date.now();"
].forEach(requireText);

if (failures.length) {
  console.error("FAIL visual design brief audit");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("PASS visual design brief audit: app-wide design direction and Bible Browser pilot guarded");
