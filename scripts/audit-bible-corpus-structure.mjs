import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'data/bible';
const GOVERNANCE_PATH = 'documentation/bible-corpus-schema-governance.json';

const verbose = process.argv.includes('--verbose') || process.env.VERBOSE_AUDIT === '1';

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`${filePath} is not valid JSON: ${error.message}`);
  }
}

function rel(filePath) {
  return filePath.split(path.sep).join('/');
}

function walkFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;

  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      out.push(...walkFiles(full));
    } else if (stat.isFile()) {
      out.push(full);
    }
  }

  return out.sort();
}

function count(values) {
  const map = new Map();
  for (const value of values) {
    map.set(value, (map.get(value) || 0) + 1);
  }
  return map;
}

function add(findings, severity, kind, filePath, detail) {
  findings.push({
    severity,
    kind,
    path: filePath,
    detail
  });
}

function validateChapterVerseShape(findings, filePath, data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    add(findings, 'HIGH', 'TOP_LEVEL_BAD_TYPE', filePath, typeof data);
    return null;
  }

  if (!data.meta || typeof data.meta !== 'object' || Array.isArray(data.meta)) {
    add(findings, 'HIGH', 'MISSING_OR_BAD_META', filePath, 'meta missing or not object');
    return null;
  }

  if (!Array.isArray(data.chapters)) {
    add(findings, 'HIGH', 'MISSING_OR_BAD_CHAPTERS', filePath, 'chapters missing or not list');
    return null;
  }

  const chapterNums = [];

  data.chapters.forEach((chapter, chapterIndex) => {
    const chapterLabel = `chapters[${chapterIndex}]`;

    if (!chapter || typeof chapter !== 'object' || Array.isArray(chapter)) {
      add(findings, 'HIGH', 'CHAPTER_NOT_OBJECT', filePath, `${chapterLabel} is not object`);
      return;
    }

    const forbiddenChapterKeys = ['meta', 'chapters', 'schema'].filter((key) => Object.prototype.hasOwnProperty.call(chapter, key));
    if (forbiddenChapterKeys.length > 0) {
      add(findings, 'CRITICAL', 'BOOK_LEVEL_KEYS_INSIDE_CHAPTER', filePath, `${chapterLabel} contains ${forbiddenChapterKeys.join(', ')}`);
    }

    if (!Object.prototype.hasOwnProperty.call(chapter, 'num') || !Object.prototype.hasOwnProperty.call(chapter, 'verses')) {
      add(findings, 'HIGH', 'BAD_CHAPTER_SHAPE', filePath, `${chapterLabel} keys=${Object.keys(chapter).sort().join(',')}`);
      return;
    }

    chapterNums.push(chapter.num);

    if (!Array.isArray(chapter.verses)) {
      add(findings, 'HIGH', 'VERSES_NOT_LIST', filePath, `${chapterLabel}.verses is not list`);
      return;
    }

    const verseNums = [];

    chapter.verses.forEach((verse, verseIndex) => {
      const verseLabel = `${chapterLabel}.verses[${verseIndex}]`;

      if (!verse || typeof verse !== 'object' || Array.isArray(verse)) {
        add(findings, 'HIGH', 'VERSE_NOT_OBJECT', filePath, `${verseLabel} is not object`);
        return;
      }

      const forbiddenVerseKeys = ['meta', 'chapters', 'schema'].filter((key) => Object.prototype.hasOwnProperty.call(verse, key));
      if (forbiddenVerseKeys.length > 0) {
        add(findings, 'CRITICAL', 'BOOK_LEVEL_KEYS_INSIDE_VERSE', filePath, `${verseLabel} contains ${forbiddenVerseKeys.join(', ')}`);
      }

      if (!Object.prototype.hasOwnProperty.call(verse, 'num') || !Object.prototype.hasOwnProperty.call(verse, 'text')) {
        add(findings, 'HIGH', 'BAD_VERSE_SHAPE', filePath, `${verseLabel} keys=${Object.keys(verse).sort().join(',')}`);
        return;
      }

      verseNums.push(verse.num);

      const textType = Array.isArray(verse.text) ? 'array' : typeof verse.text;
      if (textType !== 'string' && textType !== 'object') {
        add(findings, 'HIGH', 'VERSE_TEXT_BAD_TYPE', filePath, `${verseLabel}.text is ${textType}`);
      }
    });

    const verseCounts = count(verseNums.filter((num) => Number.isInteger(num)));
    const duplicateVerses = [...verseCounts.entries()].filter(([, total]) => total > 1).map(([num]) => num);
    if (duplicateVerses.length > 0) {
      add(findings, 'HIGH', 'DUPLICATE_NUMERIC_VERSES', filePath, `chapter ${chapter.num} duplicate verses=${duplicateVerses.join(',')}`);
    }
  });

  return chapterNums;
}

function main() {
  if (!fs.existsSync(ROOT)) {
    console.error('BLOCKED: data/bible not found');
    process.exit(1);
  }

  if (!fs.existsSync(GOVERNANCE_PATH)) {
    console.error('BLOCKED: documentation/bible-corpus-schema-governance.json not found');
    process.exit(1);
  }

  const governance = readJson(GOVERNANCE_PATH);
  const topLevelList = new Set(Object.keys(governance.governedTopLevelListFiles || {}));
  const named = new Set(Object.keys(governance.governedNamedChapterFiles || {}));
  const partial = governance.governedPartialChapterSequenceFiles || {};
  const nonChapter = governance.governedNonChapterSchemaFiles || {};

  const findings = [];
  const files = walkFiles(ROOT);

  for (const file of files) {
    const filePath = rel(file);

    if (!filePath.endsWith('.json')) {
      add(findings, 'HIGH', 'UNDECLARED_NON_JSON_FILE', filePath, 'non-json file remains under data/bible');
      continue;
    }

    let data;
    try {
      data = readJson(filePath);
    } catch (error) {
      add(findings, 'CRITICAL', 'INVALID_JSON', filePath, error.message);
      continue;
    }

    if (Array.isArray(data)) {
      if (!topLevelList.has(filePath)) {
        add(findings, 'HIGH', 'UNDECLARED_TOP_LEVEL_LIST_SCHEMA', filePath, 'top-level list not governed');
      }
      continue;
    }

    if (!data || typeof data !== 'object') {
      add(findings, 'HIGH', 'TOP_LEVEL_BAD_TYPE', filePath, typeof data);
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(nonChapter, filePath)) {
      const spec = nonChapter[filePath];
      const missing = (spec.requiredTopLevelFields || []).filter((field) => !Object.prototype.hasOwnProperty.call(data, field));
      if (missing.length > 0) {
        add(findings, 'HIGH', 'GOVERNED_NON_CHAPTER_SCHEMA_MISSING_FIELDS', filePath, `missing=${missing.join(',')}`);
      }
      continue;
    }

    const chapterNums = validateChapterVerseShape(findings, filePath, data);
    if (!chapterNums) continue;

    if (Object.prototype.hasOwnProperty.call(partial, filePath)) {
      const expected = partial[filePath].expectedChapterNums || [];
      if (JSON.stringify(chapterNums) !== JSON.stringify(expected)) {
        add(findings, 'HIGH', 'PARTIAL_SEQUENCE_CHANGED', filePath, `seen=${JSON.stringify(chapterNums)} expected=${JSON.stringify(expected)}`);
      }
      continue;
    }

    if (chapterNums.some((num) => typeof num === 'string')) {
      if (!named.has(filePath)) {
        add(findings, 'HIGH', 'UNDECLARED_STRING_CHAPTER_NUM', filePath, `nums=${JSON.stringify(chapterNums)}`);
      }
      continue;
    }

    const numericChapterNums = chapterNums.filter((num) => Number.isInteger(num));
    const chapterCounts = count(numericChapterNums);
    const duplicateChapters = [...chapterCounts.entries()].filter(([, total]) => total > 1).map(([num]) => num);
    if (duplicateChapters.length > 0) {
      add(findings, 'HIGH', 'DUPLICATE_NUMERIC_CHAPTERS', filePath, `duplicate chapters=${duplicateChapters.join(',')}`);
    }

    if (numericChapterNums.length > 0) {
      const min = Math.min(...numericChapterNums);
      const max = Math.max(...numericChapterNums);
      const start = min === 0 ? 0 : 1;
      const expected = Array.from({ length: max - start + 1 }, (_, index) => start + index);
      if (JSON.stringify(numericChapterNums) !== JSON.stringify(expected)) {
        add(findings, 'HIGH', 'CHAPTER_SEQUENCE_GAP_OR_REORDER', filePath, `seen=${JSON.stringify(numericChapterNums)} expected=${JSON.stringify(expected)}`);
      }
    }
  }

  const blocking = findings.filter((finding) => finding.severity === 'CRITICAL' || finding.severity === 'HIGH');

  if (blocking.length > 0) {
    console.error(`FAIL bible corpus structural audit: blocking=${blocking.length} findings=${findings.length}`);
    for (const finding of blocking.slice(0, 100)) {
      console.error(`${finding.severity} | ${finding.kind} | ${finding.path} | ${finding.detail}`);
    }
    if (blocking.length > 100) {
      console.error(`... truncated ${blocking.length - 100} additional blocking findings`);
    }
    process.exit(1);
  }

  if (verbose) {
    console.log(JSON.stringify({
      status: 'PASS',
      filesScanned: files.length,
      findings: findings.length,
      blocking: blocking.length,
      governedTopLevelListFiles: topLevelList.size,
      governedNamedChapterFiles: named.size,
      governedPartialChapterSequenceFiles: Object.keys(partial).length,
      governedNonChapterSchemaFiles: Object.keys(nonChapter).length
    }, null, 2));
  } else {
    console.log(`PASS bible corpus structural audit: files=${files.length} blocking=0`);
  }
}

main();
