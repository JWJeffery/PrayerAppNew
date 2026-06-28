#!/usr/bin/env node
import fs from 'node:fs';

const reportPath = process.env.GREEK_ESTHER_ADDRESS_MAPPING_CANDIDATES_REPORT || null;
const activePath = 'data/bible/OT/estherGK.json';
const drbPath = 'data/bible/translations/drb-original-douay-rheims/raw/esther.json';
const failures = [];

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    failures.push({ type: 'read-json-failed', path, error: String(error.message || error) });
    return null;
  }
}

function chapterId(chapter) {
  return String(chapter?.num ?? chapter?.chapter ?? chapter?.id ?? 'UNKNOWN');
}

function rowsInChapter(book, chapterKey) {
  const key = String(chapterKey);
  const chapter = book?.chapters?.find((row) => chapterId(row) === key);
  return Array.isArray(chapter?.verses) ? chapter.verses : [];
}

function countRange(book, chapterKey, firstVerse, lastVerse) {
  return rowsInChapter(book, chapterKey).filter((row) => {
    const n = Number(row?.num ?? row?.verse);
    return Number.isInteger(n) && n >= firstVerse && n <= lastVerse;
  }).length;
}

function countSegments(book, segments) {
  return segments.reduce((sum, segment) => sum + countRange(book, segment.chapter, segment.firstVerse, segment.lastVerse), 0);
}

function activeCount(book, chapterKey) {
  return rowsInChapter(book, chapterKey).length;
}

function candidate(label, activeChapter, sourceName, sourceSegments, active, source, status = 'candidate_count_aligned') {
  const activeRows = activeCount(active, activeChapter);
  const sourceRows = countSegments(source, sourceSegments);
  const passed = activeRows === sourceRows;
  if (!passed) failures.push({ type: 'candidate-count-mismatch', label, activeRows, sourceRows, activeChapter, sourceSegments });
  return {
    label,
    activeChapter,
    activeRows,
    sourceName,
    sourceSegments,
    sourceRows,
    status: passed ? status : 'candidate_count_mismatch'
  };
}

const active = readJson(activePath);
const drb = readJson(drbPath);

const drbCandidates = [];
const ordinaryBoundaries = [];

if (active && drb) {
  drbCandidates.push(candidate('Addition A', 'Addition A', 'DRB', [
    { chapter: 11, firstVerse: 2, lastVerse: 12 },
    { chapter: 12, firstVerse: 1, lastVerse: 6 }
  ], active, drb));

  drbCandidates.push(candidate('Addition B', 'Addition B', 'DRB', [
    { chapter: 13, firstVerse: 1, lastVerse: 7 }
  ], active, drb));

  drbCandidates.push(candidate('Addition C', 'Addition C', 'DRB', [
    { chapter: 13, firstVerse: 8, lastVerse: 18 },
    { chapter: 14, firstVerse: 1, lastVerse: 19 }
  ], active, drb));

  drbCandidates.push(candidate('Addition D candidate 15:1-16', 'Addition D', 'DRB', [
    { chapter: 15, firstVerse: 1, lastVerse: 16 }
  ], active, drb, 'candidate_count_aligned_policy_required'));

  drbCandidates.push(candidate('Addition D candidate 15:4-19', 'Addition D', 'DRB', [
    { chapter: 15, firstVerse: 4, lastVerse: 19 }
  ], active, drb, 'candidate_count_aligned_policy_required'));

  drbCandidates.push(candidate('Addition E', 'Addition E', 'DRB', [
    { chapter: 16, firstVerse: 1, lastVerse: 24 }
  ], active, drb));

  drbCandidates.push(candidate('Addition F', 'Addition F', 'DRB', [
    { chapter: 10, firstVerse: 4, lastVerse: 13 },
    { chapter: 11, firstVerse: 1, lastVerse: 1 }
  ], active, drb));

  for (const ch of [1, 2, 3, 4, 5, 6, 7, 9]) {
    ordinaryBoundaries.push({
      chapter: String(ch),
      activeRows: activeCount(active, ch),
      drbRows: countRange(drb, ch, 1, 999),
      status: activeCount(active, ch) === countRange(drb, ch, 1, 999) ? 'ordinary_count_aligned' : 'ordinary_count_mismatch'
    });
  }

  ordinaryBoundaries.push({
    chapter: '8',
    activeRows: activeCount(active, 8),
    drbRows: countRange(drb, 8, 1, 999),
    activeAlignedRange: '1-12',
    sourceExtraRange: '13-17',
    status: 'source_extra_policy_required'
  });

  ordinaryBoundaries.push({
    chapter: '10',
    activeRows: activeCount(active, 10),
    drbRows: countRange(drb, 10, 1, 999),
    activeAlignedRange: '1-3',
    sourceAdditionRange: '4-13 maps in Addition F candidate',
    status: 'ordinary_plus_addition_split'
  });
}

const report = {
  audit: 'greek-esther-address-mapping-candidates',
  status: failures.length ? 'failed' : 'passed_with_policy_boundaries',
  bibleTextMutation: false,
  scope: 'Classify candidate row-count mappings between active Greek Esther named additions and bound DRB numbered addition ranges. No text comparison or mutation.',
  activePath,
  drbPath,
  drbCandidates,
  ordinaryBoundaries,
  policyBoundaries: [
    'Addition D has two row-count-aligned DRB candidates: 15:1-16 and 15:4-19. Do not choose without further source-form policy.',
    'Ordinary Esther 8 has active rows 1-12 while DRB/KJV/NABRE sources have 1-17. Source rows 8:13-17 require address policy before lane expansion.',
    'KJV and NABRE ordinary Esther sources do not provide Greek addition rows.'
  ],
  nextRequiredWork: [
    'Resolve Addition D source-address policy.',
    'Resolve Esther 8:13-17 source-address policy.',
    'Only then create a bounded lane-expansion repair or inactive-lane policy.'
  ],
  failures
};

if (reportPath) fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Greek Esther mapping-candidate audit failed. Review failures before policy.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Record mapping candidates, then resolve Addition D and Esther 8:13-17 policy before any text mutation.');
}
