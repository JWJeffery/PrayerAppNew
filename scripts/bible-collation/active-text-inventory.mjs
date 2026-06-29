import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const EXCLUDED_SEGMENTS = new Set([
  'registry',
  'config',
  'configs',
  'translation',
  'translations',
  'source',
  'sources',
  'raw',
  'bound-source',
  'bound-sources',
  'source-witnesses'
]);

function hashText(text) {
  return crypto.createHash('sha256').update(String(text)).digest('hex');
}

function shouldSkip(relativePath) {
  const parts = relativePath.split(path.sep);
  return parts.some(part => EXCLUDED_SEGMENTS.has(part));
}

function collectJsonFiles(root, dir = root, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    const relative = path.relative(root, absolute);
    if (entry.isDirectory()) {
      if (!shouldSkip(relative)) collectJsonFiles(root, absolute, out);
    } else if (entry.isFile() && entry.name.endsWith('.json') && !shouldSkip(relative)) {
      out.push(relative);
    }
  }
  return out.sort();
}

function chapterNumber(chapter, fallback) {
  const value = chapter?.number ?? chapter?.chapter ?? chapter?.num ?? fallback;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : value;
}

function verseNumber(verse, fallback) {
  const value = verse?.number ?? verse?.verse ?? verse?.num ?? fallback;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : value;
}

function addCell(cells, file, book, chapter, verse, lane, text, sourceShape) {
  cells.push({
    file,
    book,
    chapter,
    verse,
    lane,
    textHash: hashText(text),
    textLength: String(text).length,
    blank: !String(text).trim(),
    placeholder: /^\s*(todo|tbd|placeholder|missing|fixme)\s*$/i.test(String(text)),
    sourceShape
  });
}

function collectChapterVerseCells(file, data) {
  const cells = [];
  if (!Array.isArray(data?.chapters)) return cells;
  const book = data?.meta?.id || data?.meta?.name || data?.book || path.basename(file, '.json');

  for (const [chapterIndex, chapter] of data.chapters.entries()) {
    const chapterRef = chapterNumber(chapter, chapterIndex + 1);
    const verses = Array.isArray(chapter?.verses) ? chapter.verses : [];
    for (const [verseIndex, verse] of verses.entries()) {
      const verseRef = verseNumber(verse, verseIndex + 1);
      if (typeof verse?.text === 'string') {
        addCell(cells, file, book, chapterRef, verseRef, 'text', verse.text, 'chapter_verse_string_text');
      } else if (verse?.text && typeof verse.text === 'object' && !Array.isArray(verse.text)) {
        for (const [lane, text] of Object.entries(verse.text)) {
          if (typeof text === 'string') addCell(cells, file, book, chapterRef, verseRef, lane, text, 'chapter_verse_lane_text');
        }
      }
    }
  }
  return cells;
}

function collectFallbackTextLeaves(file, data) {
  const cells = [];
  const book = data?.meta?.id || data?.meta?.name || data?.book || path.basename(file, '.json');
  function walk(value, trail) {
    if (typeof value === 'string') {
      const key = trail[trail.length - 1] || 'text';
      if (/text|reading|content|body|translation/i.test(key)) {
        addCell(cells, file, book, null, trail.join('.'), key, value, 'fallback_text_leaf');
      }
      return;
    }
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, [...trail, String(index)]));
    } else {
      for (const [key, child] of Object.entries(value)) walk(child, [...trail, key]);
    }
  }
  walk(data, []);
  return cells;
}

export function collectActiveTextInventory(options = {}) {
  const repoRoot = options.repoRoot || process.cwd();
  const bibleRoot = options.bibleRoot || 'data/bible';
  const absoluteBibleRoot = path.resolve(repoRoot, bibleRoot);
  const files = collectJsonFiles(absoluteBibleRoot);
  const cells = [];
  const parseErrors = [];

  for (const relative of files) {
    const file = path.join(bibleRoot, relative).split(path.sep).join('/');
    try {
      const data = JSON.parse(fs.readFileSync(path.join(absoluteBibleRoot, relative), 'utf8'));
      const standardCells = collectChapterVerseCells(file, data);
      if (standardCells.length) cells.push(...standardCells);
      else cells.push(...collectFallbackTextLeaves(file, data));
    } catch (error) {
      parseErrors.push({ file, error: String(error.message || error) });
    }
  }

  return { filesScanned: files.length, cells, parseErrors };
}
