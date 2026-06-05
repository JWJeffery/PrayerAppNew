#!/usr/bin/env node
import fs from "node:fs";

const resolver = fs.readFileSync("js/scripture-resolver.js", "utf8");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

const failures = [];

function requireIncludes(label, text, markers) {
  for (const marker of markers) {
    if (!text.includes(marker)) {
      failures.push(`${label} missing marker: ${marker}`);
    }
  }
}

requireIncludes("Ethiopian canonical scripture resolver", resolver, [
  "ETHIOPIAN_CANON_BOOKS",
  "Ethiopian canonical scripture resources",
  "1CLEM_ET",
  "data/bible/ET/1clementET.json",
  "HERM_ET",
  "data/bible/ET/hermastheshepherdET.json",
  "function _normalizeBibleBookKey",
  "function _resolveBibleBookSource",
  "cacheKey: etSource.path",
  "fetch(source.path)"
]);

requireIncludes("citation parser supports canonical IDs", resolver, [
  "A-Za-z0-9_",
  "_resolveBibleBookSource(book, false)"
]);

const canonicalFiles = [
  ["data/bible/ET/1clementET.json", "1CLEM_ET"],
  ["data/bible/ET/hermastheshepherdET.json", "HERM_ET"]
];

for (const [path, expectedId] of canonicalFiles) {
  if (!fs.existsSync(path)) {
    failures.push(`missing Ethiopian canonical source file: ${path}`);
    continue;
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(path, "utf8"));
  } catch (error) {
    failures.push(`invalid JSON in ${path}: ${error.message}`);
    continue;
  }

  if (parsed?.meta?.id !== expectedId) {
    failures.push(`${path} meta.id expected ${expectedId}, found ${parsed?.meta?.id}`);
  }

  if (!Array.isArray(parsed?.chapters) || parsed.chapters.length < 1) {
    failures.push(`${path} missing chapters`);
  }

  if (!Array.isArray(parsed?.chapters?.[0]?.verses) || parsed.chapters[0].verses.length < 1) {
    failures.push(`${path} missing chapter 1 verses`);
  }
}

if (/\bextra-canonical\b/i.test(resolver)) {
  failures.push("resolver must not describe Ethiopian canonical scripture as extra-canonical");
}

if (pkg.scripts?.["audit:ethiopian-canonical-scripture-resolver"] !== "node scripts/audit-ethiopian-canonical-scripture-resolver.mjs") {
  failures.push("package.json missing audit:ethiopian-canonical-scripture-resolver script");
}

if (failures.length) {
  console.error("FAIL Ethiopian canonical scripture resolver audit");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("PASS Ethiopian canonical scripture resolver audit: 1 Clement and Hermas route through ET corpus");
