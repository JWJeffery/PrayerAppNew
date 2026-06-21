#!/usr/bin/env node
import fs from 'node:fs';

const classificationPath = "data/bible/registry/canonical-ot-nabre-residual-classification.json";
const books = [
  "genesis","exodus","leviticus","numbers","deuteronomy","joshua","judges","ruth",
  "1samuel","2samuel","1kings","2kings","1chronicles","2chronicles","ezra","nehemiah",
  "esther","job","proverbs","ecclesiastes","songofsolomon","isaiah","jeremiah",
  "lamentations","ezekiel","daniel","hosea","joel","amos","obadiah","jonah","micah",
  "nahum","habakkuk","zephaniah","haggai","zechariah","malachi"
];

function n(v) {
  const x = Number.parseInt(String(v), 10);
  return Number.isFinite(x) ? x : null;
}

function refs(data) {
  const out = [];
  const chapters = data && data.chapters;
  if (!Array.isArray(chapters)) return out;

  chapters.forEach((ch, ci) => {
    const c = n(ch.number ?? ch.num ?? ch.chapter) ?? ci + 1;
    const verses = ch && ch.verses;
    if (!Array.isArray(verses)) return;

    verses.forEach((verse, vi) => {
      const v = n(verse.number ?? verse.num ?? verse.verse) ?? vi + 1;
      out.push({ ref: `${c}:${v}`, verse });
    });
  });

  return out;
}

function textDict(verse) {
  const t = verse && verse.text;
  return t && typeof t === 'object' && !Array.isArray(t) ? t : {};
}

function overlay(data, ref) {
  const [c, v] = ref.split(':');
  const value = data?.translationOverlays?.NABRE?.[String(c)]?.[String(v)];
  return typeof value === 'string' && value.trim().length > 0;
}

const classification = JSON.parse(fs.readFileSync(classificationPath, 'utf8'));
const classified = new Set(classification.entries.map((x) => `${x.book} ${x.ref}`));
const categories = new Set(classification.entries.map((x) => x.category));

const actual = [];

for (const book of books) {
  const path = `data/bible/OT/${book}.json`;
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));

  for (const row of refs(data)) {
    const main = textDict(row.verse).NABRE;
    const hasMain = typeof main === 'string' && main.trim().length > 0;
    const hasOverlay = overlay(data, row.ref);

    if (!hasMain && !hasOverlay) {
      actual.push(`${book} ${row.ref}`);
    }
  }
}

const actualSet = new Set(actual);
const unclassified = actual.filter((x) => !classified.has(x));
const stale = [...classified].filter((x) => !actualSet.has(x));
const failures = [];

if (classification.schema !== 'canonical-ot-nabre-residual-classification-v1') {
  failures.push({ type: 'schema-mismatch' });
}

if (classification.status !== 'classified_not_resolved') {
  failures.push({ type: 'status-mismatch' });
}

if (classification.entries.length !== 59) {
  failures.push({ type: 'classification-count-mismatch', expected: 59, actual: classification.entries.length });
}

if (actual.length !== 59) {
  failures.push({ type: 'actual-residual-count-mismatch', expected: 59, actual: actual.length });
}

if (unclassified.length) {
  failures.push({ type: 'unclassified-residuals', rows: unclassified });
}

if (stale.length) {
  failures.push({ type: 'stale-classification-rows', rows: stale });
}

for (const entry of classification.entries) {
  if (!entry.book || !entry.ref || !entry.category || !entry.note) {
    failures.push({ type: 'invalid-entry', entry });
  }
}

const report = {
  audit: 'canonical-ot-nabre-residual-classification',
  status: failures.length ? 'failed' : 'passed',
  actualResidualCount: actual.length,
  classifiedResidualCount: classification.entries.length,
  categories: [...categories].sort(),
  failures
};

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Review canonical OT NABRE residual classification failures.');
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Canonical OT NABRE residuals are classified; canonical OT remains not trusted.');
}
