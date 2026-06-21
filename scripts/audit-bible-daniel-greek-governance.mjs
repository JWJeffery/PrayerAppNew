#!/usr/bin/env node
import fs from 'node:fs';

const governancePath = "data/bible/registry/daniel-greek-governance.json";
const classificationPath = 'data/bible/registry/canonical-ot-nabre-residual-classification.json';

function n(v) {
  const x = Number.parseInt(String(v), 10);
  return Number.isFinite(x) ? x : null;
}

function refsByChapter(data) {
  const out = {};
  const chapters = data && data.chapters;
  if (!Array.isArray(chapters)) return out;

  chapters.forEach((ch, ci) => {
    const c = n(ch.number ?? ch.num ?? ch.chapter) ?? ci + 1;
    const verses = ch && ch.verses;
    if (!Array.isArray(verses)) return;
    if (!out[String(c)]) out[String(c)] = [];

    verses.forEach((verse, vi) => {
      const v = n(verse.number ?? verse.num ?? verse.verse) ?? vi + 1;
      out[String(c)].push(v);
    });
  });

  return out;
}

const governance = JSON.parse(fs.readFileSync(governancePath, 'utf8'));
const classification = JSON.parse(fs.readFileSync(classificationPath, 'utf8'));
const standard = JSON.parse(fs.readFileSync(governance.decisions.standardDanielFile, 'utf8'));
const greek = JSON.parse(fs.readFileSync(governance.decisions.greekDanielFile, 'utf8'));

const standardRefs = refsByChapter(standard);
const greekRefs = refsByChapter(greek);
const failures = [];

if (governance.schema !== 'daniel-greek-governance-v1') failures.push({ type: 'schema-mismatch' });
if (governance.status !== 'governed_not_textually_resolved') failures.push({ type: 'status-mismatch' });

for (const ch of governance.expectedStandardDanielShape.chaptersPresent) {
  if (!Array.isArray(standardRefs[ch]) || !standardRefs[ch].length) failures.push({ type: 'missing-standard-daniel-chapter', chapter: ch });
}

for (const ch of governance.expectedStandardDanielShape.chaptersAbsent) {
  if (Array.isArray(standardRefs[ch]) && standardRefs[ch].length) failures.push({ type: 'unexpected-standard-daniel-greek-chapter', chapter: ch });
}

const daniel3Max = Math.max(...(standardRefs['3'] || [0]));
if (daniel3Max !== governance.expectedStandardDanielShape.daniel3MaxVerse) {
  failures.push({ type: 'standard-daniel-3-shape-mismatch', expectedMax: governance.expectedStandardDanielShape.daniel3MaxVerse, actualMax: daniel3Max });
}

if (!Object.keys(greekRefs).length) {
  failures.push({ type: 'greek-daniel-empty-or-unparseable' });
}

const classified = new Set(classification.entries.filter(x => x.book === 'daniel').map(x => x.ref));
for (const ref of governance.expectedClassifiedResiduals.daniel) {
  if (!classified.has(ref)) failures.push({ type: 'missing-daniel-classification', ref });
}

const report = {
  audit: 'daniel-greek-governance',
  status: failures.length ? 'failed' : 'passed',
  standardDanielChapters: Object.fromEntries(Object.entries(standardRefs).map(([k,v]) => [k, v.length])),
  greekDanielChapters: Object.fromEntries(Object.entries(greekRefs).map(([k,v]) => [k, v.length])),
  expectedDanielClassifiedResiduals: governance.expectedClassifiedResiduals.daniel.length,
  failures
};

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Review Daniel / Greek governance failures.');
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Daniel / Greek governance boundary is guarded.');
}
