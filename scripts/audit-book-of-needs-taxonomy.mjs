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
const prayersJson = JSON.parse(read('data/prayers.json') || '{}');
const pkg = JSON.parse(read('package.json') || '{}');

const allowedCodes = new Set(['ANG', 'LC', 'EO', 'OO', 'COE']);
const retiredCodes = new Set(['ECU', 'COMMON', 'COMMON_PRAYER', 'ALL', 'UNIVERSAL']);
const optionIds = [...index.matchAll(/class="prayer-option"[^>]*data-value="([^"]+)"/g)]
  .map(match => match[1]);
const prayerJsonIds = Object.keys(prayersJson);

let assignments = {};
let contexts = {};
let codeRegistry = {};

try {
  assignments = parseConstObject(prayersJs, 'BOOK_OF_NEEDS_OPTION_TRADITIONS');
} catch (error) {
  failures.push(error.message);
}

try {
  contexts = parseConstObject(prayersJs, 'BOOK_OF_NEEDS_CONTEXTS');
} catch (error) {
  failures.push(error.message);
}

try {
  codeRegistry = parseConstObject(prayersJs, 'BOOK_OF_NEEDS_TRADITION_CODES');
} catch (error) {
  failures.push(error.message);
}

const assignmentIds = Object.keys(assignments);
const duplicateOptionIds = optionIds.filter((id, indexInArray) => optionIds.indexOf(id) !== indexInArray);
const emptyAssignments = assignmentIds.filter(id => Array.isArray(assignments[id]) && assignments[id].length === 0);
const missingAssignments = optionIds.filter(id => !(id in assignments));
const orphanAssignments = assignmentIds.filter(id => !optionIds.includes(id));
const missingPrayerData = optionIds.filter(id => !(id in prayersJson));
const orphanPrayerData = prayerJsonIds.filter(id => !optionIds.includes(id));
const unknownAssignments = [];

for (const [id, codes] of Object.entries(assignments)) {
  if (!Array.isArray(codes)) {
    unknownAssignments.push(`${id}:not-array`);
    continue;
  }

  for (const code of codes) {
    if (!allowedCodes.has(code) || retiredCodes.has(code)) {
      unknownAssignments.push(`${id}:${code}`);
    }
  }
}

const counts = Object.fromEntries([...allowedCodes].map(code => [code, 0]));
for (const codes of Object.values(assignments)) {
  if (!Array.isArray(codes)) continue;

  for (const code of codes) {
    if (code in counts) counts[code] += 1;
  }
}

const bcpGeneralIntercessions = [
  'prayer-for-the-sick',
  'prayer-for-peace',
  'prayer-for-unity',
  'prayer-for-mission',
  'prayer-for-guidance',
  'prayer-for-the-church',
  'prayer-for-the-world'
];

check(
  'Book of Needs tradition code registry is explicit',
  sameSet(Object.keys(codeRegistry), allowedCodes) &&
  prayersJs.includes('BOOK_OF_NEEDS_TAXONOMY_VERSION') &&
  prayersJs.includes('BOOK_OF_NEEDS_ALLOWED_TRADITIONS')
);

check(
  'Book of Needs contexts are explicit for all implemented taxonomy codes',
  ['ANG', 'LC', 'EO', 'OO', 'COE'].every(code => code in contexts) &&
  contexts.UNIVERSAL &&
  contexts.UNIVERSAL.returnText === 'Back to Modes'
);

check(
  'Universal is an access context, not a prayer tradition assignment',
  !Object.values(assignments).some(codes => Array.isArray(codes) && codes.includes('UNIVERSAL')) &&
  !Object.values(assignments).some(codes => Array.isArray(codes) && codes.includes('ALL'))
);

check(
  'no retired common/ecumenical bucket remains in assignments',
  !Object.values(assignments).some(codes => Array.isArray(codes) && codes.some(code => retiredCodes.has(code))) &&
  !prayersJs.includes('COMMON_PRAYER')
);

check(
  'every UI prayer option id is unique',
  optionIds.length > 0 &&
  duplicateOptionIds.length === 0
);

check(
  'index.html prayer options match data/prayers.json prayer data',
  sameSet(optionIds, prayerJsonIds) &&
  missingPrayerData.length === 0 &&
  orphanPrayerData.length === 0
);

check(
  'index.html prayer options match js/prayers.js taxonomy assignments',
  sameSet(optionIds, assignmentIds) &&
  missingAssignments.length === 0 &&
  orphanAssignments.length === 0
);

check(
  'every prayer has a non-empty explicit tradition assignment',
  assignmentIds.length > 0 &&
  emptyAssignments.length === 0 &&
  assignmentIds.every(id => Array.isArray(assignments[id]) && assignments[id].length > 0)
);

check(
  'every assigned tradition code is known',
  unknownAssignments.length === 0
);

check(
  'BCP general intercessions are explicitly Anglican/Episcopal',
  bcpGeneralIntercessions.every(id =>
    Array.isArray(assignments[id]) &&
    assignments[id].length === 1 &&
    assignments[id][0] === 'ANG'
  )
);

check(
  'Latin Catholic devotional prayers remain Latin Catholic only',
  ['thanksgiving-aquinas', 'o-salutaris', 'tantum-ergo', 'divine-praises', 'anima-christi']
    .every(id => Array.isArray(assignments[id]) && assignments[id].includes('LC') && !assignments[id].includes('ANG'))
);

check(
  'Orthodox and Oriental Orthodox overlap is explicit only where intended',
  Array.isArray(assignments['thanksgiving-basil']) &&
  assignments['thanksgiving-basil'].includes('EO') &&
  assignments['thanksgiving-basil'].includes('OO') &&
  assignments['minister-journey-orthodox']?.length === 1 &&
  assignments['minister-journey-orthodox'][0] === 'EO'
);

check(
  'runtime taxonomy helper and debug getter exist',
  prayersJs.includes('function getBookOfNeedsTraditionsForPrayer(prayerId)') &&
  prayersJs.includes('BOOK_OF_NEEDS_ALLOWED_TRADITIONS.has(code)') &&
  prayersJs.includes('window.getBookOfNeedsTaxonomy')
);

check(
  'package exposes Book of Needs taxonomy audit',
  pkg.scripts?.['audit:book-of-needs-taxonomy'] === 'node scripts/audit-book-of-needs-taxonomy.mjs'
);

if (failures.length) {
  console.error(`FAIL Book of Needs taxonomy audit: ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`- ${failure}`);
  console.error('Diagnostics:', {
    optionCount: optionIds.length,
    prayerDataCount: prayerJsonIds.length,
    assignmentCount: assignmentIds.length,
    duplicateOptionIds,
    missingPrayerData,
    orphanPrayerData,
    missingAssignments,
    orphanAssignments,
    emptyAssignments,
    unknownAssignments,
    counts
  });
  process.exit(1);
}

console.log(`PASS Book of Needs taxonomy audit: ${checks} check(s) passed; counts=${JSON.stringify(counts)}`);
