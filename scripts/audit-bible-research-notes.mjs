
import fs from "node:fs";

const index = fs.readFileSync("index.html", "utf8");
const browser = fs.readFileSync("js/bible-browser/bible-browser.js", "utf8");
const css = fs.readFileSync("css/bible-browser.css", "utf8");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

const failures = [];

function fail(message) {
  failures.push(message);
}

if (!packageJson.scripts?.["audit:bible-research-notes"]) {
  fail("package.json is missing audit:bible-research-notes script.");
}

for (const id of [
  "bible-export-research-markdown",
  "bible-research-search",
  "bible-research-filter",
  "bible-research-book",
  "bible-research-index"
]) {
  if (!index.includes(`id="${id}"`)) {
    fail(`index.html is missing ${id}.`);
  }
}

if (!browser.includes("function renderResearchIndex")) {
  fail("Bible browser is missing research-index renderer.");
}

if (!browser.includes("function buildResearchMarkdown")) {
  fail("Bible browser is missing Markdown research export.");
}

if (!browser.includes("data-research-annotation-open")) {
  fail("Research index entries do not reopen saved annotation actions.");
}

if (!browser.includes("populateResearchBookFilter")) {
  fail("Research index is missing book filter population.");
}

if (!css.includes(".bible-research-index")) {
  fail("CSS is missing research-index styling.");
}

if (!css.includes(".bible-research-controls")) {
  fail("CSS is missing research-controls styling.");
}


const guide = fs.readFileSync("js/bible-browser/passage-guide.js", "utf8");

if (!index.includes('<option value="FATHERS">Saved from the Fathers</option>')) {
  fail("Research filter is missing Saved from the Fathers option.");
}

if (!guide.includes("Save to Notebook")) {
  fail("Passage guide Fathers cards do not include Save to Notebook.");
}

if (!guide.includes("uo.bibleBrowser.fathersNotebook.v1")) {
  fail("Passage guide does not persist Fathers notebook entries.");
}

if (!browser.includes("function loadFathersNotebook")) {
  fail("Bible browser cannot load Fathers notebook entries into research index.");
}

if (!browser.includes("data-research-notebook-open")) {
  fail("Research index does not render saved Fathers notebook cards.");
}

if (!browser.includes("Saved Commentary from the Fathers")) {
  fail("Markdown export does not include saved Fathers commentary section.");
}

if (failures.length) {
  console.error("FAIL Bible research notes audit");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("PASS Bible research notes audit: searchable index and Markdown export guarded");
