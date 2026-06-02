#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const JSON_MODE = process.argv.includes('--json');

const EXPECTED_OT = {
  'genesis.json': [31,25,24,26,32,22,24,22,29,32,32,20,18,24,21,16,27,33,38,18,34,24,20,67,34,35,46,22,35,43,55,32,20,31,29,43,36,30,23,23,57,38,34,34,28,34,31,22,33,26],
  'exodus.json': [22,25,22,31,23,30,25,32,35,29,10,51,22,31,27,36,16,27,25,26,36,31,33,18,40,37,21,43,46,38,18,35,23,35,35,38,29,31,43,38],
  'leviticus.json': [17,16,17,35,19,30,38,36,24,20,47,8,59,57,33,34,16,30,37,27,24,33,44,23,55,46,34],
  'numbers.json': [54,34,51,49,31,27,89,26,23,36,35,16,33,45,41,50,13,32,22,29,35,41,30,25,18,65,23,31,40,16,54,42,56,29,34,13],
  'deuteronomy.json': [46,37,29,49,33,25,26,20,29,22,32,32,18,29,23,22,20,22,21,20,23,30,25,22,19,19,26,68,29,20,30,52,29,12],
  'joshua.json': [18,24,17,24,15,27,26,35,27,43,23,24,33,15,63,10,18,28,51,9,45,34,16,33],
  'judges.json': [36,23,31,24,31,40,25,35,57,18,40,15,25,20,20,31,13,31,30,48,25],
  'ruth.json': [22,23,18,22],
  '1samuel.json': [28,36,21,22,12,21,17,22,27,27,15,25,23,52,35,23,58,30,24,42,15,23,29,22,44,25,12,25,11,31,13],
  '2samuel.json': [27,32,39,12,25,23,29,18,13,19,27,31,39,33,37,23,29,33,43,26,22,51,39,25],
  '1kings.json': [53,46,28,34,18,38,51,66,28,29,43,33,34,31,34,34,24,46,21,43,29,53],
  '2kings.json': [18,25,27,44,27,33,20,29,37,36,21,21,25,29,38,20,41,37,37,21,26,20,37,20,30],
  '1chronicles.json': [54,55,24,43,26,81,40,40,44,14,47,40,14,17,29,43,27,17,19,8,30,19,32,31,31,32,34,21,30],
  '2chronicles.json': [17,18,17,22,14,42,22,18,31,19,23,16,22,15,19,14,19,34,11,37,20,12,21,27,28,23,9,27,36,27,21,33,25,33,27,23],
  'ezra.json': [11,70,13,24,17,22,28,36,15,44],
  'nehemiah.json': [11,20,32,23,19,19,73,18,38,39,36,47,31],
  'esther.json': [22,23,15,17,14,14,10,17,32,3],
  'job.json': [22,13,26,21,27,30,21,22,35,22,20,25,28,22,35,22,16,21,29,29,34,30,17,25,6,14,23,28,25,31,40,22,33,37,16,33,24,41,30,24,34,17],
  'proverbs.json': [33,22,35,27,23,35,27,36,18,32,31,28,25,35,33,33,28,24,29,30,31,29,35,34,28,28,27,28,27,33,31],
  'ecclesiastes.json': [18,26,22,16,20,12,29,17,18,20,10,14],
  'songofsolomon.json': [17,17,11,16,16,13,13,14],
  'isaiah.json': [31,22,26,6,30,13,25,22,21,34,16,6,22,32,9,14,14,7,25,6,17,25,18,23,12,21,13,29,24,33,9,20,24,17,10,22,38,22,8,31,29,25,28,28,25,13,15,22,26,11,23,15,12,17,13,12,21,14,21,22,11,12,19,12,25,24],
  'jeremiah.json': [19,37,25,31,31,30,34,22,26,25,23,17,27,22,21,21,27,23,15,18,14,30,40,10,38,24,22,17,32,24,40,44,26,22,19,32,21,28,18,16,18,22,13,30,5,28,7,47,39,46,64,34],
  'lamentations.json': [22,22,66,22,22],
  'ezekiel.json': [28,10,27,17,17,14,27,18,11,22,25,28,23,23,8,63,24,32,14,49,32,31,49,27,17,21,36,26,21,26,18,32,33,31,15,38,28,23,29,49,26,20,27,31,25,24,23,35],
  'daniel.json': [21,49,30,37,31,28,28,27,27,21,45,13],
  'hosea.json': [11,23,5,19,15,11,16,14,17,15,12,14,16,9],
  'joel.json': [20,32,21],
  'amos.json': [15,16,15,13,27,14,17,14,15],
  'obadiah.json': [21],
  'jonah.json': [17,10,10,11],
  'micah.json': [16,13,12,13,15,16,20],
  'nahum.json': [15,13,19],
  'habakkuk.json': [17,20,19],
  'zephaniah.json': [18,15,20],
  'haggai.json': [15,23],
  'zechariah.json': [21,13,10,14,11,15,14,23,17,12,17,14,9,21],
  'malachi.json': [14,17,18,6]
};

// Psalms is intentionally excluded here because data/bible/OT/psalms.json is a
// consolidated psalter schema, not ordinary book/chapter/verse schema.
// NT is also intentionally excluded in this first audit version because the
// target corpus appears to use modern critical-text omissions in some books;
// NT requires a governed expected-verse exception table before enforcement.

function readJson(relPath) {
  const full = path.join(ROOT, relPath);
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function expectedVerseNums(count) {
  return Array.from({ length: count }, (_, index) => index + 1);
}

function actualVerseNums(chapter) {
  if (!chapter || !Array.isArray(chapter.verses)) return [];
  return chapter.verses
    .filter((verse) => verse && Number.isInteger(verse.num))
    .map((verse) => verse.num);
}

function diffLists(expected, actual) {
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  return {
    missing: expected.filter((num) => !actualSet.has(num)),
    extra: actual.filter((num) => !expectedSet.has(num))
  };
}

const findings = [];
const checked = [];

for (const [fileName, counts] of Object.entries(EXPECTED_OT)) {
  const relPath = `data/bible/OT/${fileName}`;
  const fullPath = path.join(ROOT, relPath);

  if (!fs.existsSync(fullPath)) {
    findings.push({
      severity: 'critical',
      kind: 'MISSING_BOOK_FILE',
      path: relPath,
      expectedChapters: counts.length
    });
    continue;
  }

  const book = readJson(relPath);
  const chapters = Array.isArray(book.chapters) ? book.chapters : null;

  if (!chapters) {
    findings.push({
      severity: 'critical',
      kind: 'MISSING_CHAPTER_ARRAY',
      path: relPath,
      expectedChapters: counts.length
    });
    continue;
  }

  const chapterNums = chapters
    .filter((chapter) => chapter && Number.isInteger(chapter.num))
    .map((chapter) => chapter.num);
  const expectedChapters = expectedVerseNums(counts.length);

  const chapterDiff = diffLists(expectedChapters, chapterNums);
  if (chapterDiff.missing.length || chapterDiff.extra.length || chapterNums.length !== expectedChapters.length) {
    findings.push({
      severity: 'critical',
      kind: 'CHAPTER_COUNT_OR_SEQUENCE_MISMATCH',
      path: relPath,
      expectedChapters,
      actualChapters: chapterNums,
      missingChapters: chapterDiff.missing,
      extraChapters: chapterDiff.extra
    });
    continue;
  }

  for (const [index, expectedCount] of counts.entries()) {
    const chapterNum = index + 1;
    const chapter = chapters.find((candidate) => candidate && candidate.num === chapterNum);
    const actual = actualVerseNums(chapter);
    const expected = expectedVerseNums(expectedCount);
    const verseDiff = diffLists(expected, actual);

    checked.push(`${fileName}:${chapterNum}`);

    if (verseDiff.missing.length || verseDiff.extra.length || actual.length !== expected.length) {
      findings.push({
        severity: 'high',
        kind: 'VERSE_COUNT_OR_SEQUENCE_MISMATCH',
        path: relPath,
        chapter: chapterNum,
        expectedCount,
        actualCount: actual.length,
        missingVerses: verseDiff.missing,
        extraVerses: verseDiff.extra
      });
    }
  }
}

const result = {
  audit: 'bible-corpus-completeness',
  schema: 'prayerappnew_bible_corpus_completeness_audit_result_v1',
  status: findings.length ? 'FAIL' : 'PASS',
  scope: {
    ordinaryOtNonPsalms: Object.keys(EXPECTED_OT).length,
    psalms: 'excluded_consolidated_psalter_schema_requires_separate_audit',
    nt: 'excluded_pending_governed_expected_verse_exception_table'
  },
  checkedChapterCount: checked.length,
  findingCount: findings.length,
  findings
};

if (JSON_MODE) {
  console.log(JSON.stringify(result, null, 2));
} else if (findings.length) {
  console.log(`FAIL bible corpus completeness audit: checkedChapters=${checked.length} blocking=${findings.length}`);
  for (const finding of findings.slice(0, 25)) {
    if (finding.kind === 'VERSE_COUNT_OR_SEQUENCE_MISMATCH') {
      console.log(
        `${finding.severity} ${finding.kind} ${finding.path} chapter=${finding.chapter} ` +
        `expected=${finding.expectedCount} actual=${finding.actualCount} ` +
        `missing=${JSON.stringify(finding.missingVerses)} extra=${JSON.stringify(finding.extraVerses)}`
      );
    } else {
      console.log(`${finding.severity} ${finding.kind} ${finding.path}`);
    }
  }
  if (findings.length > 25) {
    console.log(`... ${findings.length - 25} additional findings`);
  }
} else {
  console.log(`PASS bible corpus completeness audit: checkedChapters=${checked.length} blocking=0`);
}

process.exit(findings.length ? 1 : 0);

