#!/usr/bin/env node

import fs from 'node:fs';

const required = [
  {
    "path": "data/bible/OT/isaiah.json",
    "bookId": "ISA",
    "bookKey": "isaiah",
    "translation": "DRB",
    "refs": [
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        1,
        3
      ],
      [
        1,
        4
      ],
      [
        1,
        5
      ],
      [
        1,
        6
      ],
      [
        1,
        7
      ],
      [
        1,
        8
      ],
      [
        1,
        9
      ],
      [
        1,
        10
      ],
      [
        1,
        11
      ],
      [
        1,
        12
      ],
      [
        1,
        13
      ],
      [
        1,
        14
      ],
      [
        1,
        15
      ],
      [
        1,
        16
      ],
      [
        1,
        17
      ],
      [
        1,
        18
      ],
      [
        11,
        1
      ],
      [
        11,
        2
      ],
      [
        11,
        3
      ],
      [
        11,
        4
      ],
      [
        11,
        5
      ],
      [
        11,
        6
      ],
      [
        11,
        7
      ],
      [
        11,
        8
      ],
      [
        11,
        9
      ],
      [
        11,
        10
      ],
      [
        58,
        1
      ],
      [
        58,
        2
      ],
      [
        58,
        3
      ],
      [
        58,
        4
      ],
      [
        58,
        5
      ],
      [
        58,
        6
      ],
      [
        58,
        7
      ],
      [
        58,
        8
      ],
      [
        58,
        9
      ],
      [
        58,
        10
      ],
      [
        58,
        11
      ],
      [
        58,
        12
      ]
    ],
    "knownVersificationMismatch": null
  },
  {
    "path": "data/bible/OT/exodus.json",
    "bookId": "EXO",
    "bookKey": "exodus",
    "translation": "DRB",
    "refs": [
      [
        14,
        15
      ],
      [
        14,
        16
      ],
      [
        14,
        17
      ],
      [
        14,
        18
      ],
      [
        14,
        19
      ],
      [
        14,
        20
      ],
      [
        14,
        21
      ],
      [
        14,
        22
      ],
      [
        14,
        23
      ],
      [
        14,
        24
      ],
      [
        14,
        25
      ],
      [
        14,
        26
      ],
      [
        14,
        27
      ],
      [
        14,
        28
      ],
      [
        14,
        29
      ],
      [
        14,
        30
      ],
      [
        14,
        31
      ],
      [
        15,
        1
      ]
    ],
    "knownVersificationMismatch": null
  },
  {
    "path": "data/bible/NT/hebrews.json",
    "bookId": "HEB",
    "bookKey": "hebrews",
    "translation": "DRB",
    "refs": [
      [
        9,
        11
      ],
      [
        9,
        12
      ],
      [
        9,
        13
      ],
      [
        9,
        14
      ],
      [
        9,
        15
      ],
      [
        9,
        16
      ],
      [
        9,
        17
      ],
      [
        9,
        18
      ],
      [
        9,
        19
      ],
      [
        9,
        20
      ],
      [
        9,
        21
      ],
      [
        9,
        22
      ],
      [
        9,
        23
      ],
      [
        9,
        24
      ],
      [
        9,
        25
      ],
      [
        9,
        26
      ],
      [
        9,
        27
      ],
      [
        9,
        28
      ]
    ],
    "knownVersificationMismatch": null
  },
  {
    "path": "data/bible/NT/3john.json",
    "bookId": "3JH",
    "bookKey": "3john",
    "translation": "DRB",
    "refs": [
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        1,
        3
      ],
      [
        1,
        4
      ],
      [
        1,
        5
      ],
      [
        1,
        6
      ],
      [
        1,
        7
      ],
      [
        1,
        8
      ],
      [
        1,
        9
      ],
      [
        1,
        10
      ],
      [
        1,
        11
      ],
      [
        1,
        12
      ],
      [
        1,
        13
      ],
      [
        1,
        14
      ]
    ],
    "knownVersificationMismatch": {
      "lothCitation": "3 John 1:1-15",
      "drboAvailableRefs": "3 John 1:1-14",
      "note": "DRBO places the final salutation in verse 14; the existing target sequence has a separate NRSV verse 15."
    }
  },
  {
    "path": "data/bible/NT/romans.json",
    "bookId": "ROM",
    "bookKey": "romans",
    "translation": "DRB",
    "refs": [
      [
        8,
        5
      ],
      [
        8,
        6
      ],
      [
        8,
        7
      ],
      [
        8,
        8
      ],
      [
        8,
        9
      ],
      [
        8,
        10
      ],
      [
        8,
        11
      ],
      [
        8,
        12
      ],
      [
        8,
        13
      ],
      [
        8,
        14
      ],
      [
        8,
        15
      ],
      [
        8,
        16
      ],
      [
        8,
        17
      ],
      [
        8,
        18
      ],
      [
        8,
        19
      ],
      [
        8,
        20
      ],
      [
        8,
        21
      ],
      [
        8,
        22
      ],
      [
        8,
        23
      ],
      [
        8,
        24
      ],
      [
        8,
        25
      ],
      [
        8,
        26
      ],
      [
        8,
        27
      ]
    ],
    "knownVersificationMismatch": null
  }
];
const failures = [];

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function getDrbText(data, chapterNum, verseNum) {
  const chapter = (data.chapters ?? []).find((item) => item.num === chapterNum);
  if (!chapter) return null;

  const verse = (chapter.verses ?? []).find((item) => item.num === verseNum);
  if (verse?.text && typeof verse.text === 'object' && !Array.isArray(verse.text) && typeof verse.text.DRB === 'string' && verse.text.DRB.trim().length > 0) {
    return verse.text.DRB;
  }

  const overlay = data.translationOverlays?.DRB?.[String(chapterNum)]?.[String(verseNum)];
  if (typeof overlay === 'string' && overlay.trim().length > 0) return overlay;

  return null;
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

  if (meta.translations?.[target.translation]?.sourceWitness !== 'https://www.drbo.org/') {
    failures.push(`${target.path}: ${target.translation} sourceWitness must be https://www.drbo.org/`);
  }

  if (meta.lastTranslationIntake?.translation !== target.translation) {
    failures.push(`${target.path}: missing lastTranslationIntake for ${target.translation}`);
  }

  if (meta.lastTranslationIntake?.tranche !== 'BIBLE-DRB-B-loth-c08-book-intake') {
    failures.push(`${target.path}: lastTranslationIntake.tranche must be BIBLE-DRB-B-loth-c08-book-intake`);
  }

  if (meta.lastTranslationIntake?.publicRenderingPermitted !== false) {
    failures.push(`${target.path}: publicRenderingPermitted must remain false for ${target.translation} intake`);
  }

  if (meta.lastTranslationIntake?.notCurrentOfficialLothNabAssertion !== true) {
    failures.push(`${target.path}: notCurrentOfficialLothNabAssertion must be true`);
  }

  for (const [chapterNum, verseNum] of target.refs) {
    const text = getDrbText(data, chapterNum, verseNum);
    if (typeof text !== 'string' || text.trim().length < 8) {
      failures.push(`${target.path}: missing ${target.translation} text for ${chapterNum}:${verseNum}`);
    }
  }

  if (target.knownVersificationMismatch) {
    const mismatchChapters = meta.lastTranslationIntake?.mismatchChapters ?? [];
    if (!mismatchChapters.includes(1)) {
      failures.push(`${target.path}: expected mismatch chapter 1 in lastTranslationIntake`);
    }
  }
}

if (failures.length) {
  console.error(`FAIL douay-rheims-loth-c08-books-intake: ${failures.length} failure(s)`);
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log('PASS douay-rheims-loth-c08-books-intake: DRB present for Isaiah, Exodus, Hebrews, 3 John, and Romans LOTH C08 ranges');
