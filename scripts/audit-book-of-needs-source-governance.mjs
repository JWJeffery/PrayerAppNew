#!/usr/bin/env node
import fs from 'node:fs';

const failures = [];
let checks = 0;

function read(path) {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch (_error) {
    failures.push(`missing file: ${path}`);
    return '';
  }
}

function check(label, condition) {
  checks += 1;
  if (!condition) failures.push(label);
}

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function sameSet(a, b) {
  const left = sorted(a);
  const right = sorted(b);

  return left.length === right.length &&
    left.every((value, index) => value === right[index]);
}

function extractConstObject(source, constName) {
  const marker = `const ${constName} =`;
  const start = source.indexOf(marker);

  if (start < 0) {
    throw new Error(`Missing ${constName}`);
  }

  const braceStart = source.indexOf('{', start);
  if (braceStart < 0) {
    throw new Error(`Missing opening brace for ${constName}`);
  }

  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let i = braceStart; i < source.length; i += 1) {
    const char = source[i];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(braceStart, i + 1);
      }
    }
  }

  throw new Error(`Could not parse ${constName}`);
}

function parseConstObject(source, constName) {
  const literal = extractConstObject(source, constName);
  return Function(`"use strict"; return (${literal});`)();
}

const index = read('index.html');
const prayersJs = read('js/prayers.js');
const prayersJsonRaw = read('data/prayers.json');
const governanceRaw = read('documentation/book-of-needs-source-governance.json');
const pkg = JSON.parse(read('package.json') || '{}');

const prayersJson = JSON.parse(prayersJsonRaw || '{}');
const governance = JSON.parse(governanceRaw || '{}');
const assignments = parseConstObject(prayersJs, 'BOOK_OF_NEEDS_OPTION_TRADITIONS');
const contexts = parseConstObject(prayersJs, 'BOOK_OF_NEEDS_CONTEXTS');

const counts = {
  ANG: 0,
  LC: 0,
  EO: 0,
  OO: 0,
  COE: 0
};

for (const codes of Object.values(assignments)) {
  if (!Array.isArray(codes)) continue;

  for (const code of codes) {
    if (code in counts) counts[code] += 1;
  }
}

const assignedByTradition = {
  OO: Object.entries(assignments)
    .filter(([, codes]) => Array.isArray(codes) && codes.includes('OO'))
    .map(([id]) => id),
  COE: Object.entries(assignments)
    .filter(([, codes]) => Array.isArray(codes) && codes.includes('COE'))
    .map(([id]) => id)
};

const inventoried = {
  OO: (governance.traditionSpecificPrayerIds?.OO || []).map(item => item.id),
  COE: (governance.traditionSpecificPrayerIds?.COE || []).map(item => item.id)
};

const wholeCorpus = `${index}\n${prayersJs}\n${prayersJsonRaw}`;
const forbiddenSourceHits = [];

for (const phrase of governance.forbiddenSourcePhrasesForTraditionSpecificUse || []) {
  if (wholeCorpus.includes(phrase)) {
    forbiddenSourceHits.push(phrase);
  }
}

const rejectedIdHits = [];

for (const id of governance.rejectedSyntheticPrayerIds || []) {
  if (
    index.includes(`data-value="${id}"`) ||
    prayersJs.includes(`'${id}'`) ||
    Object.prototype.hasOwnProperty.call(prayersJson, id)
  ) {
    rejectedIdHits.push(id);
  }
}

check(
  'Book of Needs source governance inventory exists and states the no-fake-prayers principle',
  governance.schemaVersion === 1 &&
  typeof governance.principle === 'string' &&
  governance.principle.includes('Do not manufacture tradition-specific prayers') &&
  Array.isArray(governance.futureAdditionRequirements)
);

check(
  'governance records current coverage counts',
  JSON.stringify(governance.coverageCountsAtCreation) === JSON.stringify(counts)
);

check(
  'Oriental Orthodox and Church of the East are both seeded',
  governance.traditionStatus?.OO?.status === 'seeded' &&
  governance.traditionStatus?.COE?.status === 'seeded'
);

check(
  'OO and COE assignments require provenance inventory entries',
  sameSet(assignedByTradition.OO, inventoried.OO) &&
  sameSet(assignedByTradition.COE, inventoried.COE)
);

check(
  'COE is seeded with real sourced prayers',
  counts.COE === 4 &&
  Array.isArray(governance.traditionSpecificPrayerIds?.COE) &&
  governance.traditionSpecificPrayerIds.COE.length === 4 &&
  governance.traditionStatus?.COE?.status === 'seeded'
);

check(
  'OO has real sourced prayers including the four Armenian Apostolic entries',
  counts.OO === 5 &&
  assignedByTradition.OO.length === 5 &&
  assignedByTradition.OO.includes('thanksgiving-basil') &&
  assignedByTradition.OO.includes('armenian-for-the-sick') &&
  assignedByTradition.OO.includes('armenian-prayer-against-troubles') &&
  assignedByTradition.OO.includes('armenian-for-travellers') &&
  assignedByTradition.OO.includes('armenian-prayer-before-work')
);

check(
  'rejected synthetic OO and COE starter IDs are absent',
  rejectedIdHits.length === 0
);

check(
  'Universal Office original pastoral texts are not tradition-specific OO/COE source material',
  forbiddenSourceHits.length === 0
);

check(
  'future additions must distinguish received adapted translated source-reviewed or original material',
  governance.futureAdditionRequirements.some(item => item.includes('received/traditional, adapted, translated, source-reviewed, or original')) &&
  governance.futureAdditionRequirements.some(item => item.includes('separate Universal Office original category'))
);

check(
  'package exposes Book of Needs source governance audit',
  pkg.scripts?.['audit:book-of-needs-source-governance'] === 'node scripts/audit-book-of-needs-source-governance.mjs'
);

if (failures.length) {
  console.error(`FAIL Book of Needs source governance audit: ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`- ${failure}`);
  console.error('Diagnostics:', {
    counts,
    assignedByTradition,
    inventoried,
    rejectedIdHits,
    forbiddenSourceHits
  });
  process.exit(1);
}

check(
  'EO includes Jesus Prayer as a received lay-devotional prayer',
  counts.EO >= 10 &&
  prayersJs.includes("'jesus-prayer': ['EO']") &&
  prayersJson['jesus-prayer']?.source?.includes('Common Orthodox received form')
);

check(
  'EO includes Trisagion Prayers as a received lay-devotional prayer',
  counts.EO >= 11 &&
  prayersJs.includes("'trisagion-prayers': ['EO']") &&
  prayersJson['trisagion-prayers']?.source?.includes('Common Orthodox received form')
);

check(
  'EO includes common devotional prayer batch',
  counts.EO >= 14 &&
  prayersJs.includes("'prayer-of-st-mardarios': ['EO']") &&
  prayersJs.includes("'prayer-of-st-philaret': ['EO']") &&
  prayersJs.includes("'prayer-of-st-ephrem': ['EO']") &&
  prayersJson['prayer-of-st-mardarios']?.source?.includes('Common Orthodox received form') &&
  prayersJson['prayer-of-st-philaret']?.source?.includes('Common Orthodox received form') &&
  prayersJson['prayer-of-st-ephrem']?.source?.includes('Common Orthodox received Lenten prayer')
);

check(
  'EO includes daily devotional prayer batch',
  counts.EO >= 18 &&
  prayersJs.includes("'prayer-for-every-hour': ['EO']") &&
  prayersJs.includes("'orthodox-before-reading-scripture': ['EO']") &&
  prayersJs.includes("'orthodox-before-work': ['EO']") &&
  prayersJs.includes("'orthodox-before-study': ['EO']") &&
  prayersJson['prayer-for-every-hour']?.source?.includes('Common Orthodox received form') &&
  prayersJson['orthodox-before-reading-scripture']?.source?.includes('Common Orthodox prayer before reading') &&
  prayersJson['orthodox-before-work']?.source?.includes('Common Orthodox received form') &&
  prayersJson['orthodox-before-study']?.source?.includes('Common Orthodox student prayer')
);

check(
  'EO includes evening devotional prayer batch',
  counts.EO >= 22 &&
  prayersJs.includes("'prayer-of-st-john-chrysostom': ['EO']") &&
  prayersJs.includes("'prayer-of-st-macarius': ['EO']") &&
  prayersJs.includes("'prayer-of-st-basil': ['EO']") &&
  prayersJs.includes("'prayer-to-guardian-angel': ['EO']") &&
  prayersJson['prayer-of-st-john-chrysostom']?.source?.includes('Common Orthodox received form') &&
  prayersJson['prayer-of-st-macarius']?.source?.includes('Common Orthodox received form') &&
  prayersJson['prayer-of-st-basil']?.source?.includes('Common Orthodox received form') &&
  prayersJson['prayer-to-guardian-angel']?.source?.includes('Common Orthodox received form')
);

check(
  'EO includes mealtime prayer batch',
  counts.EO >= 26 &&
  prayersJs.includes("'orthodox-before-meals': ['EO']") &&
  prayersJs.includes("'orthodox-after-meals': ['EO']") &&
  prayersJs.includes("'orthodox-blessing-before-meal': ['EO']") &&
  prayersJs.includes("'orthodox-thanksgiving-after-meal': ['EO']") &&
  prayersJson['orthodox-before-meals']?.source?.includes('Common Orthodox mealtime prayer') &&
  prayersJson['orthodox-after-meals']?.source?.includes('Common Orthodox mealtime prayer') &&
  prayersJson['orthodox-blessing-before-meal']?.source?.includes('Common Orthodox mealtime prayer') &&
  prayersJson['orthodox-thanksgiving-after-meal']?.source?.includes('Common Orthodox mealtime prayer')
);

console.log(`PASS Book of Needs source governance audit: ${checks} check(s) passed; counts=${JSON.stringify(counts)}`);
