
import fs from "node:fs";

const files = {
  packageJson: JSON.parse(fs.readFileSync("package.json", "utf8")),
  index: fs.readFileSync("index.html", "utf8"),
  browser: fs.readFileSync("js/bible-browser/bible-browser.js", "utf8"),
  guide: fs.readFileSync("js/bible-browser/passage-guide.js", "utf8"),
  readingPlans: fs.readFileSync("js/bible-browser/reading-plans.js", "utf8"),
  css: fs.readFileSync("css/bible-browser.css", "utf8"),
  release: fs.readFileSync("scripts/prepare-web-release.mjs", "utf8")
};

const failures = [];

function fail(message) {
  failures.push(message);
}

function requireIncludes(label, haystack, needles) {
  for (const needle of needles) {
    if (!haystack.includes(needle)) {
      fail(`${label} missing marker: ${needle}`);
    }
  }
}

function requireAny(label, haystack, needles) {
  if (!needles.some(needle => haystack.includes(needle))) {
    fail(`${label} missing all expected markers: ${needles.join(" | ")}`);
  }
}

function requireScript(name) {
  if (!files.packageJson.scripts?.[name]) {
    fail(`package.json missing script: ${name}`);
  }
}

[
  "audit:bible-browser-smoke",
  "audit:bible-research-notes",
  "audit:bible-reading-plan",
  "audit:patristic-runtime",
  "audit:bible-browser-workflows",
  "release:web"
].forEach(requireScript);

requireIncludes("reader-first passage controls", files.index, [
  'bible-reader-controls',
  'id="bible-translation-select"',
  'id="bible-reference-input"',
  'id="bible-reference-go"',
  'Passage',
  'Open Passage'
]);

if (files.index.indexOf('id="bible-translation-select"') > files.index.indexOf('id="bible-reference-input"')) {
  fail("Translation selector should remain before passage input.");
}

requireIncludes("browse-by-book controls", files.index, [
  '<summary>Browse by Book</summary>',
  'id="bible-book-select"',
  'id="bible-chapter-select"',
  'Open Chapter'
]);

requireIncludes("parallel reader controls", files.index, [
  'id="bible-parallel-toggle"',
  'id="bible-parallel-select"',
  'Compare two translations',
  'Second Translation'
]);

requireIncludes("parallel reader logic", files.browser, [
  "parallelEnabled",
  "parallelTranslation"
]);

requireIncludes("advanced search controls", files.index, [
  '<summary>Advanced Search</summary>',
  'id="bible-search-input"',
  'id="bible-search-scope"',
  'id="bible-search-go"'
]);

requireAny("search grammar summary", files.browser, [
  "quoted phrase",
  "searchTerms",
  "searchTerm"
]);

requireAny("search boolean grammar", files.browser, [
  " AND ",
  " OR ",
  "NOT"
]);

requireIncludes("highlight color UI", files.index, [
  'id="bible-highlight-color"',
  '<option value="yellow">Yellow</option>',
  '<option value="pink">Pink</option>',
  '<option value="green">Green</option>',
  '<option value="blue">Blue</option>',
  '<option value="purple">Purple</option>'
]);

requireIncludes("highlight color logic", files.browser, [
  "const HIGHLIGHT_COLORS",
  "highlightColorKey",
  "highlightColor: currentHighlightColor",
  "function setAnnotationHighlightColor"
]);

requireIncludes("highlight color CSS", files.css, [
  ".bible-highlight-yellow",
  ".bible-highlight-pink",
  ".bible-highlight-green",
  ".bible-highlight-blue",
  ".bible-highlight-purple"
]);

requireIncludes("multi-verse annotation model", files.browser, [
  "segments",
  "normalizeAnnotation",
  "getAnnotationSegments",
  "annotationToPassageRange"
]);

requireAny("multi-verse selection creation", files.browser, [
  "pendingSelectedRanges",
  "selectedSegments",
  "selectionSegments",
  "createAnnotation",
  "selectedText"
]);

requireIncludes("annotation panels use stable study drawer", files.browser, [
  'title: "Highlight Options"',
  'title: "Add a Note"',
  'mode: "study"',
  "function reflowContextPanel",
  'panel.dataset.contextMode === "study"'
]);

requireIncludes("annotation study drawer CSS", files.css, [
  ".bible-context-panel-study",
  ".bible-context-panel-body"
]);

requireIncludes("Fathers runtime guide", files.guide, [
  "RUNTIME_MANIFEST_PATH",
  "queryFathersForRanges",
  "loadFathersForRanges",
  "loadFathersForCurrentPassage",
  "Save to Notebook"
]);

requireIncludes("Fathers notebook storage", files.guide, [
  "uo.bibleBrowser.fathersNotebook.v1",
  "loadFathersNotebook",
  "saveWitnessToNotebook",
  "universal-office:fathers-notebook-updated"
]);

requireIncludes("Fathers add-to-note workflow", files.guide, [
  "Add to Note",
  "data-add-witness-note",
  "addWitnessToAnnotationNote",
  "universal-office:fathers-add-to-note"
]);

requireIncludes("Bible browser receives Fathers note append", files.browser, [
  "appendFathersCommentToAnnotation",
  "formatFathersNoteAppendix",
  "universal-office:fathers-add-to-note"
]);

requireIncludes("research notes controls", files.index, [
  'id="bible-export-research-markdown"',
  'id="bible-research-search"',
  'id="bible-research-filter"',
  'id="bible-research-book"',
  'id="bible-research-index"',
  '<option value="FATHERS">Saved from the Fathers</option>'
]);

requireIncludes("research notes behavior", files.browser, [
  "renderResearchIndex",
  "filteredResearchAnnotations",
  "filteredResearchNotebookItems",
  "buildResearchMarkdown",
  "Saved Commentary from the Fathers",
  "data-research-notebook-open"
]);

requireIncludes("reading plan UI", files.index, [
  'id="bible-plan-start-date"',
  'id="bible-plan-active-date"',
  'id="bible-plan-toggle-complete"',
  'id="bible-plan-progress"',
  'id="bible-plan-status"',
  'Reading Plan'
]);

requireIncludes("reading plan behavior", files.readingPlans, [
  "buildPlan",
  "365",
  "completed",
  "localStorage",
  "Mark Complete"
]);

requireIncludes("public browser APIs", files.browser, [
  "window.UniversalOfficeBibleBrowser",
  "getCurrentResolved",
  "openAnnotationActions",
  "appendFathersCommentToAnnotation",
  "reflowContextPanel"
]);

requireIncludes("public passage guide APIs", files.guide, [
  "window.UniversalOfficePassageGuide",
  "currentPassageRanges",
  "queryFathersForRanges",
  "saveWitnessToNotebook",
  "addWitnessToAnnotationNote"
]);

for (const path of [
  "js/bible-browser/bible-browser.js",
  "js/bible-browser/passage-guide.js",
  "js/bible-browser/reading-plans.js",
  "data/commentary/patristic-witness-runtime/manifest.json"
]) {
  if (!fs.existsSync(path)) {
    fail(`Bible browser source/runtime path missing: ${path}`);
  }
}

if (files.index.includes("Citation") || files.index.includes("Open Citation")) {
  fail("Reader-first UI should not regress to Citation/Open Citation language.");
}

if (files.index.includes("Study Helps") || files.index.includes("bible-guide-fathers-current")) {
  fail("Fathers controls should not return to the sidebar Study Helps block.");
}

if (failures.length) {
  console.error("FAIL Bible browser workflow audit");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("PASS Bible browser workflow audit: reader, search, annotations, Fathers, research notes, and reading plan guarded");
