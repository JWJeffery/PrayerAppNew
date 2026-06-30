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
    appliedSetText: 0,
    appliedDeleteText: 0,
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

  const sourceRows = collectRows(source, { lane: sourceLane, includeChapterZero: target.includeSourceChapterZero === true });
  const activeRows = collectRows(active, { lane, includeChapterZero: true });

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
      summary.residuals.push({ type: 'missing-active-ref', ref });
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

  if (apply && summary.failures.length === 0) {
    for (const op of summary.operations) {
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

    if (summary.appliedSetText || summary.appliedDeleteText) {
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
    acc.appliedSetText += item.appliedSetText;
    acc.appliedDeleteText += item.appliedDeleteText;
    acc.residualCount += item.residualCount;
    acc.failureCount += item.failures.length;
    return acc;
  }, {
    sourceRefs: 0,
    activeRefs: 0,
    plannedSetText: 0,
    plannedDeleteText: 0,
    appliedSetText: 0,
    appliedDeleteText: 0,
    residualCount: 0,
    failureCount: 0
  });

  return {
    schema: 'bible-text-mass-repair-v1',
    apply: options.apply === true,
    bibleTextMutated: options.apply === true && (totals.appliedSetText > 0 || totals.appliedDeleteText > 0),
    targetCount: targets.length,
    totals,
    targets: summaries
  };
}
