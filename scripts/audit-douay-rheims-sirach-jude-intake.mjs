#!/usr/bin/env node

import fs from 'node:fs';

const required = [
  {
    path: 'data/bible/OT/sirach.json',
    bookId: 'SIR',
    translation: 'DRB',
    refs: Array.from({ length: 18 }, (_, index) => index + 1),
    sourceWitness: 'https://www.drbo.org/',
  },
  {
    path: 'data/bible/NT/jude.json',
    bookId: 'JUD',
    translation: 'DRB',
    refs: [1,2,3,4,5,6,7,8,12,13,17,18,19,20,21,22,23,24,25],
    sourceWitness: 'https://www.drbo.org/',
  },
];

const failures = [];

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

for (const target of required) {
  if (!fs.existsSync(target.path)) {
    failures.push(`${target.path}: missing`);
    continue;
  }

  const data = readJson(target.path);
  const meta = data.meta ?? {};
  if (meta.id !== target.bookId) failures.push(`${target.path}: expected meta.id ${target.bookId}`);
  if (!meta.translations?.[target.translation]) failures.push(`${target.path}: missing meta.translations.${target.translation}`);
  if (meta.translations?.[target.translation]?.rights !== 'Public Domain') {
    failures.push(`${target.path}: ${target.translation} rights must be Public Domain`);
  }
  if (meta.translations?.[target.translation]?.sourceWitness !== target.sourceWitness) {
    failures.push(`${target.path}: ${target.translation} sourceWitness must be ${target.sourceWitness}`);
  }
  if (meta.lastTranslationIntake?.translation !== target.translation) {
    failures.push(`${target.path}: missing lastTranslationIntake for ${target.translation}`);
  }
  if (meta.lastTranslationIntake?.publicRenderingPermitted !== false) {
    failures.push(`${target.path}: publicRenderingPermitted must remain false for ${target.translation} intake`);
  }
  if (meta.lastTranslationIntake?.notCurrentOfficialLothNabAssertion !== true) {
    failures.push(`${target.path}: notCurrentOfficialLothNabAssertion must be true`);
  }

  const chapter = (data.chapters ?? []).find((item) => item.num === 1);
  if (!chapter) {
    failures.push(`${target.path}: missing chapter 1`);
    continue;
  }

  const verses = new Map((chapter.verses ?? []).map((verse) => [verse.num, verse]));
  for (const ref of target.refs) {
    const verse = verses.get(ref);
    if (!verse) {
      failures.push(`${target.path}: missing chapter 1 verse ${ref}`);
      continue;
    }
    if (!verse.text || typeof verse.text !== 'object' || Array.isArray(verse.text)) {
      failures.push(`${target.path}: chapter 1 verse ${ref} text must be translation object`);
      continue;
    }
    const text = verse.text[target.translation];
    if (typeof text !== 'string' || text.trim().length < 8) {
      failures.push(`${target.path}: chapter 1 verse ${ref} missing ${target.translation} text`);
    }
  }
}

if (failures.length) {
  console.error(`FAIL douay-rheims-sirach-jude-intake: ${failures.length} failure(s)`);
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log('PASS douay-rheims-sirach-jude-intake: DRB present for Sirach 1:1-18 and Jude 1:1-8,12-13,17-25; rendering remains blocked');
