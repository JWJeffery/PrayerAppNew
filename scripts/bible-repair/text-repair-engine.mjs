import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function hashText(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function refNumber(row, keys, fallback) {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && value !== '') {
      const parsed = Number.parseInt(String(value), 10);
      return Number.isFinite(parsed) && String(value).match(/^\d+$/) ? parsed : String(value);
    }
  }
  return fallback;
}

function chapterRef(chapter, fallback) {
  return refNumber(chapter, ['number', 'chapter', 'num'], fallback);
}

function verseRef(verse, fallback) {
  return refNumber(verse, ['number', 'verse', 'num'], fallback);
}

function getVerseText(verse, lane) {
  if (!verse || typeof verse !== 'object') return null;

  if (lane === 'text') {
    if (typeof verse.text === 'string') return verse.text;
    if (verse.text && typeof verse.text === 'object' && !Array.isArray(verse.text) && typeof verse.text.text === 'string') {
      return verse.text.text;
    }
    return null;
  }

  if (verse.text && typeof verse.text === 'object' && !Array.isArray(verse.text) && typeof verse.text[lane] === 'string') {
    return verse.text[lane];
  }

  return null;
}

function setVerseText(verse, lane, value) {
  if (lane === 'text') {
    verse.text = value;
    return true;
  }

  if (!verse.text || typeof verse.text !== 'object' || Array.isArray(verse.text)) {
    return false;
  }

  verse.text[lane] = value;
  return true;
}

function deleteVerseText(verse, lane) {
  if (lane === 'text') {
    if (typeof verse.text !== 'string') return false;
    verse.text = '';
    return true;
  }

  if (!verse.text || typeof verse.text !== 'object' || Array.isArray(verse.text)) {
    return false;
  }

  delete verse.text[lane];
  return true;
}

function verseIdentityKey(chapter) {
  const first = Array.isArray(chapter?.verses) ? chapter.verses.find(item => item && typeof item === 'object') : null;
  for (const key of ['num', 'number', 'verse']) {
    if (first && Object.prototype.hasOwnProperty.call(first, key)) return key;
  }
  return 'num';
}

function numericValue(value) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && /^\d+$/.test(String(value)) ? parsed : null;
}

function findChapter(book, chapterValue) {
  for (const [index, chapter] of (book?.chapters || []).entries()) {
    if (String(chapterRef(chapter, index + 1)) === String(chapterValue)) return chapter;
  }
  return null;
}

function findVerse(chapter, verseValue) {
  for (const [index, verse] of (chapter?.verses || []).entries()) {
    if (String(verseRef(verse, index + 1)) === String(verseValue)) return verse;
  }
  return null;
}

function insertVerseText(book, lane, chapterValue, verseValue, value) {
  const chapter = findChapter(book, chapterValue);
  if (!chapter || !Array.isArray(chapter.verses)) return false;

  const existing = findVerse(chapter, verseValue);
  if (existing) return setVerseText(existing, lane, value);

  const key = verseIdentityKey(chapter);
  const numericVerse = numericValue(verseValue);
  const verseObject = {
    [key]: numericVerse ?? String(verseValue),
    text: lane === 'text' ? value : { [lane]: value }
  };

  const insertAt = chapter.verses.findIndex(item => {
    const itemValue = numericValue(item?.[key] ?? item?.num ?? item?.number ?? item?.verse);
    return numericVerse !== null && itemValue !== null && itemValue > numericVerse;
  });

  if (insertAt === -1) chapter.verses.push(verseObject);
  else chapter.verses.splice(insertAt, 0, verseObject);

  return true;
}

function filterRowsByRefs(rowResult, refs) {
  if (!refs) return rowResult;
  return {
    rows: new Map([...rowResult.rows.entries()].filter(([ref]) => refs.has(String(ref)))),
    duplicateRefs: rowResult.duplicateRefs.filter(ref => refs.has(String(ref)))
  };
}

function collectRows(book, options = {}) {
  const lane = options.lane || 'text';
  const includeChapterZero = options.includeChapterZero === true;
  const rows = new Map();
  const duplicateRefs = [];

  for (const [chapterIndex, chapter] of (book?.chapters || []).entries()) {
    const chapterValue = chapterRef(chapter, chapterIndex + 1);
    if (!includeChapterZero && Number(chapterValue) === 0) continue;

    for (const [verseIndex, verse] of (chapter?.verses || []).entries()) {
      const verseValue = verseRef(verse, verseIndex + 1);
      const key = `${chapterValue}:${verseValue}`;
      const text = getVerseText(verse, lane);

      if (typeof text !== 'string') continue;

      if (rows.has(key)) {
        duplicateRefs.push(key);
        continue;
      }

      rows.set(key, {
        ref: key,
        chapter: chapterValue,
        verse: verseValue,
        text,
        verseObject: verse
      });
    }
  }

  return { rows, duplicateRefs };
}

function compactOperation(op) {
  return {
    type: op.type,
    ref: op.ref,
    beforeHash: op.beforeHash || null,
    afterHash: op.afterHash || null,
    beforeLength: op.beforeLength ?? null,
    afterLength: op.afterLength ?? null
  };
}

export function planTextRepair(target, options = {}) {
  const repoRoot = options.repoRoot || process.cwd();
  const apply = options.apply === true;
  const activePath = target.activePath;
  const sourcePath = target.sourcePath;
  const lane = target.lane;
  const sourceLane = target.sourceLane || 'text';
  const deleteOrphaned = target.deleteOrphaned === true;
  const insertMissingActiveRefs = target.insertMissingActiveRefs === true;
  const targetRefs = Array.isArray(target.refs) && target.refs.length
    ? new Set(target.refs.map(ref => String(ref)))
    : null;

  const summary = {
    id: target.id || `${activePath}:${lane}`,
    activePath,
    sourcePath,
    lane,
    sourceLane,
    apply,
    deleteOrphaned,
    status: 'pending',
    sourceRefs: 0,
    activeRefs: 0,
    plannedSetText: 0,
    plannedDeleteText: 0,
    plannedInsertText: 0,
    appliedSetText: 0,
    appliedDeleteText: 0,
    appliedInsertText: 0,
    residualCount: 0,
    duplicateSourceRefs: 0,
    duplicateActiveRefs: 0,
    failures: [],
    residuals: [],
    operations: []
  };

  let active;
  let source;

  try {
    active = readJson(path.resolve(repoRoot, activePath));
  } catch (error) {
    summary.failures.push({ type: 'active-read-failed', path: activePath, error: String(error.message || error) });
  }

  try {
    source = readJson(path.resolve(repoRoot, sourcePath));
  } catch (error) {
    summary.failures.push({ type: 'source-read-failed', path: sourcePath, error: String(error.message || error) });
  }

  if (summary.failures.length) {
    summary.status = 'failed';
    summary.residualCount = summary.residuals.length;
    return summary;
  }

  const sourceRows = filterRowsByRefs(
    collectRows(source, { lane: sourceLane, includeChapterZero: target.includeSourceChapterZero === true }),
    targetRefs
  );
  const activeRows = filterRowsByRefs(
    collectRows(active, { lane, includeChapterZero: true }),
    targetRefs
  );

  summary.sourceRefs = sourceRows.rows.size;
  summary.activeRefs = activeRows.rows.size;
  summary.duplicateSourceRefs = sourceRows.duplicateRefs.length;
  summary.duplicateActiveRefs = activeRows.duplicateRefs.length;

  for (const ref of sourceRows.duplicateRefs) {
    summary.residuals.push({ type: 'duplicate-source-ref', ref });
  }

  for (const ref of activeRows.duplicateRefs) {
    summary.residuals.push({ type: 'duplicate-active-ref', ref });
  }

  for (const [ref, sourceRow] of sourceRows.rows.entries()) {
    const activeRow = activeRows.rows.get(ref);
    if (!activeRow) {
      if (insertMissingActiveRefs) {
        summary.operations.push({
          type: 'insert_text',
          ref,
          chapter: sourceRow.chapter,
          verse: sourceRow.verse,
          text: sourceRow.text,
          afterHash: hashText(sourceRow.text),
          afterLength: sourceRow.text.length
        });
      } else {
        summary.residuals.push({ type: 'missing-active-ref', ref });
      }
      continue;
    }

    if (activeRow.text !== sourceRow.text) {
      summary.operations.push({
        type: 'set_text',
        ref,
        text: sourceRow.text,
        beforeHash: hashText(activeRow.text),
        afterHash: hashText(sourceRow.text),
        beforeLength: activeRow.text.length,
        afterLength: sourceRow.text.length
      });
    }
  }

  for (const [ref, activeRow] of activeRows.rows.entries()) {
    if (sourceRows.rows.has(ref)) continue;

    if (deleteOrphaned) {
      summary.operations.push({
        type: 'delete_text',
        ref,
        beforeHash: hashText(activeRow.text),
        beforeLength: activeRow.text.length
      });
    } else {
      summary.residuals.push({ type: 'source-missing-ref', ref });
    }
  }

  summary.plannedSetText = summary.operations.filter(op => op.type === 'set_text').length;
  summary.plannedDeleteText = summary.operations.filter(op => op.type === 'delete_text').length;
  summary.plannedInsertText = summary.operations.filter(op => op.type === 'insert_text').length;

  if (apply && summary.failures.length === 0) {
    for (const op of summary.operations) {
      if (op.type === 'insert_text') {
        if (insertVerseText(active, lane, op.chapter, op.verse, op.text)) summary.appliedInsertText += 1;
        else summary.residuals.push({ type: 'apply-insert-unsafe-shape', ref: op.ref });
        continue;
      }

      const row = activeRows.rows.get(op.ref);
      if (!row) {
        summary.residuals.push({ type: 'apply-row-not-found', ref: op.ref });
        continue;
      }

      if (op.type === 'set_text') {
        if (setVerseText(row.verseObject, lane, op.text)) summary.appliedSetText += 1;
        else summary.residuals.push({ type: 'apply-set-unsafe-shape', ref: op.ref });
      }

      if (op.type === 'delete_text') {
        if (deleteVerseText(row.verseObject, lane)) summary.appliedDeleteText += 1;
        else summary.residuals.push({ type: 'apply-delete-unsafe-shape', ref: op.ref });
      }
    }

    if (summary.appliedSetText || summary.appliedDeleteText || summary.appliedInsertText) {
      fs.writeFileSync(path.resolve(repoRoot, activePath), `${JSON.stringify(active, null, 2)}\n`, 'utf8');
    }
  }

  summary.residualCount = summary.residuals.length;
  summary.status = summary.failures.length ? 'failed' : 'planned';
  if (apply && !summary.failures.length) summary.status = 'applied';
  summary.operations = summary.operations.map(compactOperation);

  return summary;
}

export function runTextRepair(targets, options = {}) {
  const summaries = targets.map(target => planTextRepair(target, options));
  const totals = summaries.reduce((acc, item) => {
    acc.sourceRefs += item.sourceRefs;
    acc.activeRefs += item.activeRefs;
    acc.plannedSetText += item.plannedSetText;
    acc.plannedDeleteText += item.plannedDeleteText;
    acc.plannedInsertText += item.plannedInsertText || 0;
    acc.appliedSetText += item.appliedSetText;
    acc.appliedDeleteText += item.appliedDeleteText;
    acc.appliedInsertText += item.appliedInsertText || 0;
    acc.residualCount += item.residualCount;
    acc.failureCount += item.failures.length;
    return acc;
  }, {
    sourceRefs: 0,
    activeRefs: 0,
    plannedSetText: 0,
    plannedDeleteText: 0,
    plannedInsertText: 0,
    appliedSetText: 0,
    appliedDeleteText: 0,
    appliedInsertText: 0,
    residualCount: 0,
    failureCount: 0
  });

  return {
    schema: 'bible-text-mass-repair-v1',
    apply: options.apply === true,
    bibleTextMutated: options.apply === true && (totals.appliedSetText > 0 || totals.appliedDeleteText > 0 || totals.appliedInsertText > 0),
    targetCount: targets.length,
    totals,
    targets: summaries
  };
}
