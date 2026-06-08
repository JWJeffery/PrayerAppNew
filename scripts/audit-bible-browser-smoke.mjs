import fs from "node:fs";
import vm from "node:vm";

const failures = [];

function fail(message) {
  failures.push(message);
}

function read(path) {
  return fs.readFileSync(path, "utf-8");
}

function hasClassToken(markup, className) {
  const escapedClass = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`class=["'][^"']*\\b${escapedClass}\\b[^"']*["']`).test(markup);
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

if (!hasClassToken(index, "bible-browser-workspace")) {
  fail("index.html is missing reader-first Bible Browser workspace.");
}

if (!hasClassToken(index, "bible-reader-controls")) {
  fail("index.html is missing reader-first top controls.");
}

if (!index.includes('<label for="bible-reference-input">Passage</label>')) {
  fail("Bible Browser still lacks plain-language Passage label.");
}

if (!index.includes('Open Passage')) {
  fail("Bible Browser still lacks Open Passage button text.");
}

if (!index.includes('Compare two translations')) {
  fail("Bible Browser still lacks Compare two translations label.");
}

if (!index.includes('<label for="bible-parallel-select">Second Translation</label>')) {
  fail("Bible Browser still lacks Second Translation label.");
}

if (!index.includes('<summary>Advanced Search</summary>')) {
  fail("Bible Browser does not hide advanced search behind a disclosure.");
}

if (index.includes('Open Citation') || index.includes('>Citation<') || index.includes('Show two translations') || index.includes('Compare with') || index.includes('class="bible-browser-panel"')) {
  fail("Bible Browser still contains old sidebar/citation wording.");
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

if (!index.includes("bible-sidebar-details")) {
  fail("index.html is missing collapsed Notes and Highlights drawer.");
}

if (index.includes('<label>Study Helps</label>') || index.includes('id="bible-passage-guide"') || index.includes('id="bible-guide-fathers-current"')) {
  fail("index.html still exposes Fathers/Study Helps in the sidebar instead of contextual panel only.");
}

if (!index.includes('id="bible-fathers-selection-btn"')) {
  fail("index.html is missing selection-toolbar Fathers button.");
}

if (!index.includes('id="bible-context-panel"')) {
  fail("index.html is missing contextual Bible panel.");
}

if (index.includes("Search Scope")) {
  fail("index.html still uses scholar-facing Search Scope label.");
}

if (index.includes("Passage Guide")) {
  fail("index.html still uses scholar-facing Passage Guide label.");
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

if (!browser.includes("pendingPassageRanges")) {
  fail("Bible browser does not preserve selected passage ranges for Passage Guide.");
}

if (!browser.includes("loadFathersForSelection")) {
  fail("Bible browser does not support selected-passage Fathers lookup.");
}

if (!browser.includes("showContextPanel")) {
  fail("Bible browser does not support contextual note/commentary panel.");
}

if (!browser.includes("All available Bible books")) {
  fail("Bible browser still lacks lay-facing all-books search label.");
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

if (!browser.includes("all words")) {
  fail("Bible browser does not document plain-language all-words search behavior.");
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


if (!browser.includes("openAnnotationActions")) {
  fail("Bible browser does not show highlight action choices before reopening note editor.");
}

if (!browser.includes("available Bible text")) {
  fail("Bible browser still uses loaded-corpus language for missing verses.");
}

if (browser.includes("requested segment")) {
  fail("Bible browser still uses requested-segment language in user-visible summary.");
}

if (!css.includes("max-height: calc(var(--bible-context-max-height")) {
  fail("Bible browser CSS does not constrain contextual panel body height.");
}

if (!index.includes("find passages, save notes, and study with the Fathers")) {
  fail("Bible browser subtitle is not plain-language.");
}


if (!css.includes(".bible-browser-workspace")) {
  fail("Bible browser CSS is missing reader-first workspace styling.");
}

if (!css.includes(".bible-primary-controls")) {
  fail("Bible browser CSS is missing top control bar styling.");
}

if (!css.includes(".bible-secondary-controls")) {
  fail("Bible browser CSS is missing secondary control row styling.");
}

if (!browser.includes("function normalizeAnnotation")) {
  fail("Bible browser is missing annotation normalization.");
}

if (!browser.includes("segments")) {
  fail("Bible browser annotation model does not preserve segment arrays.");
}

if (!browser.includes("function getAnnotationSegments")) {
  fail("Bible browser is missing annotation segment accessor.");
}


if (!browser.includes("function selectionSegmentsFromRange")) {
  fail("Bible browser does not build annotation segments from multi-verse selections.");
}

if (browser.includes("currently work with one selected verse at a time")) {
  fail("Bible browser still blocks multi-verse highlight/note selection.");
}

if (!browser.includes("Highlight selected Bible text")) {
  fail("Bible browser highlight toolbar text is not multi-verse ready.");
}


if (!browser.includes("flatMap(annotation => annotation.segments")) {
  fail("Bible browser does not render multi-verse annotation segments per verse.");
}

if (!browser.includes("firstRenderedAnnotationMark")) {
  fail("Bible browser does not anchor annotation actions to rendered highlight marks.");
}

if (!browser.includes("annotation.segments.some")) {
  fail("Bible browser current-view notes do not detect multi-verse annotation segments.");
}


if (!browser.includes("jumpToAnnotation(button.dataset.annotationOpen);\n                openAnnotationActions(button.dataset.annotationOpen);")) {
  fail("Bible browser notes drawer does not open highlight options for annotations.");
}

if (!browser.includes("const item = normalizeAnnotation(annotation, index);")) {
  fail("Bible browser annotation import does not use segment normalization.");
}

if (browser.includes("missing required anchor fields")) {
  fail("Bible browser annotation import still rejects segment-array annotation exports.");
}


if (!index.includes('id="bible-plan-start-date"')) {
  fail("Bible Browser is missing reading-plan start-date control.");
}

if (!index.includes('id="bible-plan-toggle-complete"')) {
  fail("Bible Browser is missing reading-plan completion toggle.");
}

if (!index.includes('js/bible-browser/reading-plans.js')) {
  fail("Bible Browser does not load reading plan script.");
}


if (!index.includes('id="bible-research-index"')) {
  fail("Bible Browser is missing research notes index.");
}

if (!index.includes('id="bible-export-research-markdown"')) {
  fail("Bible Browser is missing research notes Markdown export.");
}


if (!index.includes('id="bible-highlight-color"')) {
  fail("Bible Browser is missing highlighter color selector.");
}

if (!browser.includes("const HIGHLIGHT_COLORS")) {
  fail("Bible Browser is missing highlighter color registry.");
}

if (!browser.includes("highlightColor: currentHighlightColor")) {
  fail("Bible Browser does not save selected highlighter color on new annotations.");
}

if (!browser.includes("function setAnnotationHighlightColor")) {
  fail("Bible Browser cannot change color for existing highlights.");
}

if (!css.includes(".bible-highlight-yellow") || !css.includes(".bible-highlight-pink") || !css.includes(".bible-highlight-green") || !css.includes(".bible-highlight-blue") || !css.includes(".bible-highlight-purple")) {
  fail("Bible Browser CSS is missing pastel highlighter color classes.");
}


if (!index.includes('<option value="FATHERS">Saved from the Fathers</option>')) {
  fail("Bible Browser is missing Saved from the Fathers research filter.");
}

if (!browser.includes("loadFathersNotebook")) {
  fail("Bible Browser is missing Fathers notebook integration.");
}


if (!browser.includes("function reflowContextPanel")) {
  fail("Bible Browser is missing context-panel reflow after async content loads.");
}

if (!browser.includes("universal-office:context-panel-reflow")) {
  fail("Bible Browser is missing context-panel reflow event listener.");
}

if (!browser.includes("reflowContextPanel(anchorRect);")) {
  fail("Bible Browser does not reflow Fathers panel after commentary loads.");
}


if (!browser.includes('mode: "study"')) {
  fail("Fathers context panels are not using study drawer mode.");
}

if (!browser.includes('panel.dataset.contextMode === "study"')) {
  fail("Bible Browser context panel does not branch into study drawer positioning.");
}

if (!css.includes(".bible-context-panel-study")) {
  fail("Bible Browser CSS is missing study drawer panel styling.");
}


if (!browser.includes("appendFathersCommentToAnnotation")) {
  fail("Bible Browser is missing Fathers-to-note append behavior.");
}

if (!browser.includes("universal-office:fathers-add-to-note")) {
  fail("Bible Browser is missing Fathers-to-note event listener.");
}


if (!browser.includes('title: "Highlight Options",\n            anchorRect,\n            mode: "study"')) {
  fail("Highlight Options panel is not using study drawer positioning.");
}

if (!browser.includes('title: "Add a Note",\n            anchorRect,\n            mode: "study"')) {
  fail("Add a Note panel is not using study drawer positioning.");
}

