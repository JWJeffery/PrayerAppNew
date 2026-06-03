import fs from "node:fs";

const index = fs.readFileSync("index.html", "utf8");
const plan = fs.readFileSync("js/bible-browser/reading-plans.js", "utf8");
const css = fs.readFileSync("css/bible-browser.css", "utf8");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

const failures = [];

function fail(message) {
  failures.push(message);
}

if (!packageJson.scripts?.["audit:bible-reading-plan"]) {
  fail("package.json is missing audit:bible-reading-plan script.");
}

if (!index.includes('class="bible-browser-details bible-reading-plan-details"')) {
  fail("index.html is missing Reading Plan disclosure.");
}

if (!index.includes('id="bible-plan-start-date"')) {
  fail("index.html is missing user-selected start date input.");
}

if (!index.includes('id="bible-plan-active-date"')) {
  fail("index.html is missing reading-date input.");
}

if (!index.includes('id="bible-plan-toggle-complete"')) {
  fail("index.html is missing manual completion toggle.");
}

if (!index.includes('js/bible-browser/reading-plans.js')) {
  fail("index.html does not load reading-plans.js.");
}

if (!plan.includes("const DAYS_IN_PLAN = 365")) {
  fail("reading plan does not declare 365-day plan.");
}

if (!plan.includes("getPlanDay(startDate, activeDate)")) {
  fail("reading plan does not calculate day from selected start date.");
}

if (!plan.includes("completedDays")) {
  fail("reading plan does not persist completed days.");
}

if (!plan.includes("toggleCurrentDayComplete")) {
  fail("reading plan is missing manual completion toggle behavior.");
}

if (!plan.includes("bible-reference-go")) {
  fail("reading plan does not open readings through the Bible Browser passage control.");
}

if (plan.includes("January 1") || plan.includes("Jan 1")) {
  fail("reading plan contains fixed January 1 language.");
}

if (!css.includes(".bible-reading-plan-details")) {
  fail("CSS is missing reading-plan styling.");
}

if (!css.includes(".bible-plan-progress")) {
  fail("CSS is missing reading-plan progress styling.");
}

if (failures.length) {
  console.error("FAIL Bible reading plan audit");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("PASS Bible reading plan audit: start-date plan and manual completion tracking guarded");
