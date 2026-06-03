import fs from "node:fs";
import vm from "node:vm";

const failures = [];

function fail(message) {
  failures.push(message);
}

function read(path) {
  return fs.readFileSync(path, "utf-8");
}

const index = read("index.html");
const browser = read("js/bible-browser/bible-browser.js");
const parser = read("js/bible-browser/reference-parser.js");
const css = read("css/bible-browser.css");

if (!index.includes('<base href="/">')) {
  fail("index.html is missing <base href=\"/\"> for /tools/bible route-safe relative assets.");
}

if (!index.includes("openBibleBrowser()")) {
  fail("index.html is missing Scripture Browser mode button wiring.");
}

if (!index.includes('id="bible-browser-section"')) {
  fail("index.html is missing #bible-browser-section.");
}

if (!index.includes('id="bible-passage-summary"')) {
  fail("index.html is missing Bible passage summary panel.");
}

if (!index.includes('id="bible-chapter-select"')) {
  fail("index.html is missing Bible chapter selector.");
}

if (!index.includes('id="bible-parallel-toggle"')) {
  fail("index.html is missing Bible parallel reader toggle.");
}

if (!index.includes('id="bible-parallel-select"')) {
  fail("index.html is missing Bible parallel reader translation selector.");
}

if (!index.includes('id="bible-prev-chapter"') || !index.includes('id="bible-next-chapter"')) {
  fail("index.html is missing Bible previous/next chapter controls.");
}

if (!index.includes('id="bible-current-notes"')) {
  fail("index.html is missing current-view notes panel.");
}

if (!index.includes('id="bible-passage-guide"')) {
  fail("index.html is missing Passage Guide panel.");
}

if (!index.includes('js/bible-browser/passage-guide.js')) {
  fail("index.html does not load the Passage Guide script.");
}

if (!index.includes('id="bible-annotation-editor"')) {
  fail("index.html is missing annotation editor panel.");
}

if (!index.includes("js/bible-browser/reference-parser.js")) {
  fail("index.html is missing Bible reference parser script.");
}

if (!index.includes("js/bible-browser/bible-browser.js")) {
  fail("index.html is missing Bible browser script.");
}

if (!index.includes("css/bible-browser.css")) {
  fail("index.html is missing Bible browser stylesheet.");
}

if (!browser.includes('history.replaceState(null, "", "/tools/bible")')) {
  fail("Bible browser does not preserve /tools/bible route.");
}

if (!browser.includes('const bookUrl = book.path.startsWith("/") ? book.path : `/${book.path}`;')) {
  fail("Bible browser fetches Bible data without root-normalizing book.path.");
}

if (!browser.includes("requestedSegments")) {
  fail("Bible browser does not preserve requested citation segment metadata.");
}

if (!browser.includes("bible-segment-block")) {
  fail("Bible browser does not render visible segment blocks.");
}

if (!browser.includes("populateChapterSelect")) {
  fail("Bible browser does not populate chapter selector.");
}

if (!browser.includes("changeBibleChapter")) {
  fail("Bible browser does not expose previous/next chapter navigation.");
}

if (!browser.includes("attachSearchMetadata")) {
  fail("Bible browser does not attach search metadata for summary display.");
}

if (!browser.includes("bible-search-match")) {
  fail("Bible browser does not render search-match highlighting.");
}

if (!browser.includes("renderCurrentNotesList")) {
  fail("Bible browser does not render current-view annotation notes.");
}

if (!browser.includes("parallelEnabled")) {
  fail("Bible browser does not preserve parallel reader state.");
}

if (!browser.includes("getVerseTextExact")) {
  fail("Bible browser does not detect per-translation verse availability.");
}

if (!browser.includes("bible-parallel-columns")) {
  fail("Bible browser does not render parallel translation columns.");
}

if (!browser.includes("setParallelReader")) {
  fail("Bible browser does not expose parallel reader test API.");
}

if (!browser.includes("getCurrentResolved")) {
  fail("Bible browser does not expose current resolved passage for Passage Guide.");
}

if (!browser.includes("parseSearchQuery")) {
  fail("Bible browser does not parse search grammar.");
}

if (!browser.includes("textMatchesSearchGrammar")) {
  fail("Bible browser does not evaluate search grammar.");
}

if (!browser.includes("bible-segment-grammar")) {
  fail("Bible browser does not render search grammar summary.");
}

if (!browser.includes("implicit AND")) {
  fail("Bible browser does not document implicit AND behavior.");
}

if (!browser.includes("openAnnotationEditor")) {
  fail("Bible browser does not expose annotation editor.");
}

if (!browser.includes("saveAnnotationEditor")) {
  fail("Bible browser does not save edited annotation comments.");
}

if (!browser.includes("deleteAnnotationEditor")) {
  fail("Bible browser does not delete annotations through the editor.");
}

if (!browser.includes("resolved.warnings")) {
  fail("Bible browser does not preserve invalid-reference warnings on resolved passages.");
}

if (!browser.includes("missingCount")) {
  fail("Bible browser does not count missing verses in partially available references.");
}

if (!browser.includes("requestedCount")) {
  fail("Bible browser does not count requested verses for partial-reference summaries.");
}

if (!browser.includes("formatMissingVerseWarning")) {
  fail("Bible browser does not consolidate missing verse warnings.");
}

if (browser.includes("Reference parsed, but no verses were resolved")) {
  fail("Bible browser still throws away fully unresolved reference summaries instead of rendering them.");
}

if (!css.includes("#bible-browser-section")) {
  fail("Bible browser CSS is missing #bible-browser-section styling.");
}

if (!css.includes(".bible-passage-summary")) {
  fail("Bible browser CSS is missing passage summary styling.");
}

if (!css.includes(".bible-chapter-nav")) {
  fail("Bible browser CSS is missing chapter navigation styling.");
}

if (!css.includes(".bible-search-match")) {
  fail("Bible browser CSS is missing search match styling.");
}

if (!css.includes(".bible-segment-scope")) {
  fail("Bible browser CSS is missing search scope summary styling.");
}

if (!css.includes(".bible-current-notes")) {
  fail("Bible browser CSS is missing current-view notes styling.");
}

if (!css.includes(".bible-annotation-editor")) {
  fail("Bible browser CSS is missing annotation editor styling.");
}

if (!css.includes(".bible-parallel-columns")) {
  fail("Bible browser CSS is missing parallel reader column styling.");
}

if (!css.includes(".bible-translation-unavailable")) {
  fail("Bible browser CSS is missing unavailable-translation styling.");
}

if (!css.includes(".bible-segment-grammar")) {
  fail("Bible browser CSS is missing search grammar summary styling.");
}

const context = { window: {} };
vm.runInNewContext(parser, context);
const api = context.window.UniversalOfficeBibleReferenceParser;

if (!api?.parseReference) {
  fail("Bible reference parser does not expose parseReference.");
} else {
  const parsed = api.parseReference("Hebrews 2:15-3:8; 4:16");
  if (parsed.references.length !== 2) {
    fail("Parser did not produce two segments for Hebrews 2:15-3:8; 4:16.");
  }
  const first = parsed.references[0];
  const second = parsed.references[1];

  if (first.bookKey !== "hebrews" || first.startChapter !== 2 || first.startVerse !== 15 || first.endChapter !== 3 || first.endVerse !== 8) {
    fail("Parser did not correctly resolve Hebrews 2:15-3:8.");
  }

  if (second.bookKey !== "hebrews" || second.startChapter !== 4 || second.startVerse !== 16 || second.endChapter !== 4 || second.endVerse !== 16) {
    fail("Parser did not correctly inherit Hebrews across semicolon segment 4:16.");
  }
}

const hebrews = JSON.parse(read("data/bible/NT/hebrews.json"));
const chapter4 = hebrews.chapters.find(ch => Number(ch.num) === 4);
const verse416 = chapter4?.verses?.find(v => Number(v.num) === 16);

if (!verse416) {
  fail("Hebrews 4:16 is missing from data/bible/NT/hebrews.json.");
}

const chapter8 = hebrews.chapters.find(ch => Number(ch.num) === 8);
const verse816 = chapter8?.verses?.find(v => Number(v.num) === 16);

if (verse816) {
  fail("Unexpected Hebrews 8:16 found; audit assumes Hebrews 8 ends before verse 16.");
}

if (failures.length) {
  console.error("FAIL bible-browser smoke audit");
  for (const item of failures) console.error(" - " + item);
  process.exit(1);
}

console.log("PASS bible-browser smoke audit: route=/tools/bible segmented citation display guarded");
