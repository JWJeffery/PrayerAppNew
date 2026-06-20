import fs from 'fs';

const profilePath = 'data/bible/registry/canon-profiles/roman-catholic.draft.json';
const reportPath = process.env.CATHOLIC_ADDRESSABILITY_AUDIT_REPORT || '/tmp/bible-catholic-corpus-addressability-audit.json';

const requiredSamples = [
  { identity_id: 'GENESIS', chapter: 1, verse: 1, mode: 'chapter_verse' },
  { identity_id: 'PSALMS', psalm: 23, mode: 'whole_psalm' },
  { identity_id: 'ISAIAH', chapter: 7, verse: 14, mode: 'chapter_verse' },
  { identity_id: 'TOBIT', chapter: 1, verse: 1, mode: 'chapter_verse' },
  { identity_id: 'JUDITH', chapter: 1, verse: 1, mode: 'chapter_verse' },
  { identity_id: 'WISDOM', chapter: 1, verse: 1, mode: 'chapter_verse' },
  { identity_id: 'SIRACH', chapter: 1, verse: 1, mode: 'chapter_verse' },
  { identity_id: 'BARUCH', chapter: 1, verse: 1, mode: 'chapter_verse' },
  { identity_id: '1_MACCABEES', chapter: 1, verse: 1, mode: 'chapter_verse' },
  { identity_id: '2_MACCABEES', chapter: 1, verse: 1, mode: 'chapter_verse' },
  { identity_id: 'ESTHER', chapter: 1, verse: 1, mode: 'chapter_verse' },
  { identity_id: 'DANIEL', chapter: 3, verse: 24, mode: 'chapter_verse' },
  { identity_id: 'MATTHEW', chapter: 1, verse: 1, mode: 'chapter_verse' },
  { identity_id: 'LUKE', chapter: 1, verse: 1, mode: 'chapter_verse' },
  { identity_id: 'REVELATION', chapter: 1, verse: 1, mode: 'chapter_verse' }
];

const report = {
  result: 'OK',
  profilePath,
  sampleCount: requiredSamples.length,
  passCount: 0,
  failCount: 0,
  failures: [],
  samples: []
};

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function pickText(value, book) {
  if (typeof value === 'string') return value.trim();

  if (value && typeof value === 'object') {
    if (typeof value.text === 'string') return value.text.trim();

    if (value.text && typeof value.text === 'object') {
      const translations = [
        book?.meta?.defaultTranslation,
        'NRSV',
        'Grail1963',
        'Coverdale',
        'Rotherham',
        'DRB',
        'KJV',
        'JPS1985',
        ...(Array.isArray(book?.meta?.translations) ? book.meta.translations : []),
        ...Object.keys(value.text)
      ].filter(Boolean);

      for (const translation of translations) {
        if (typeof value.text[translation] === 'string' && value.text[translation].trim()) {
          return value.text[translation].trim();
        }
      }
    }

    for (const key of ['NRSV', 'Grail1963', 'Coverdale', 'Rotherham', 'DRB', 'KJV', 'JPS1985', 'content', 'value']) {
      if (typeof value[key] === 'string' && value[key].trim()) return value[key].trim();
    }
  }

  return '';
}

function findChapter(book, chapterNum) {
  if (Array.isArray(book?.chapters)) {
    return book.chapters.find(chapter => Number(chapter?.num) === Number(chapterNum)) || null;
  }

  if (book?.chapters && typeof book.chapters === 'object') {
    return book.chapters[String(chapterNum)] || book.chapters[chapterNum] || null;
  }

  return null;
}

function findVerse(chapter, verseNum) {
  if (Array.isArray(chapter?.verses)) {
    return chapter.verses.find(verse => Number(verse?.num) === Number(verseNum)) || null;
  }

  if (chapter?.verses && typeof chapter.verses === 'object') {
    return chapter.verses[String(verseNum)] || chapter.verses[verseNum] || null;
  }

  if (chapter && typeof chapter === 'object') {
    return chapter[String(verseNum)] || chapter[verseNum] || null;
  }

  return null;
}

function findPsalm(book, psalmNum) {
  if (Array.isArray(book)) {
    const byIndex = book[Number(psalmNum) - 1];
    if (byIndex) return byIndex;

    return book.find(psalm =>
      Number(psalm?.num) === Number(psalmNum) ||
      Number(psalm?.number) === Number(psalmNum) ||
      Number(psalm?.psalm) === Number(psalmNum) ||
      Number(psalm?.id) === Number(psalmNum)
    ) || null;
  }

  if (book?.psalms && Array.isArray(book.psalms)) {
    return book.psalms[Number(psalmNum) - 1] || null;
  }

  if (book?.psalms && typeof book.psalms === 'object') {
    return book.psalms[String(psalmNum)] || book.psalms[psalmNum] || null;
  }

  return null;
}

function resolveChapterVerse(book, chapterNum, verseNum) {
  const chapter = findChapter(book, chapterNum);
  if (!chapter) return { ok: false, failure: 'chapter not found', shape: null };

  const verse = findVerse(chapter, verseNum);
  if (!verse) return { ok: false, failure: 'verse not found', shape: null };

  const text = pickText(verse, book);
  if (!text) return { ok: false, failure: 'verse text not found', shape: 'chapter_verse_object' };

  return { ok: true, failure: null, shape: 'chapters_array_by_num/verses_array_by_num' };
}

function resolveWholePsalm(book, psalmNum) {
  const psalm = findPsalm(book, psalmNum);
  if (!psalm) return { ok: false, failure: 'psalm not found', shape: null };

  const text = pickText(psalm, book);
  if (!text) return { ok: false, failure: 'whole psalm text not found', shape: 'psalm_object' };

  return { ok: true, failure: null, shape: 'psalms_array_index/whole_psalm_text' };
}

if (!fs.existsSync(profilePath)) {
  report.result = 'FAIL';
  report.failures.push(`${profilePath} missing`);
} else {
  const profile = readJson(profilePath);
  const entries = Array.isArray(profile.entries) ? profile.entries : [];

  for (const sample of requiredSamples) {
    const entry = entries.find(item => item.identity_id === sample.identity_id);
    const reference = sample.mode === 'whole_psalm'
      ? `${sample.identity_id} ${sample.psalm}`
      : `${sample.identity_id} ${sample.chapter}:${sample.verse}`;

    const item = {
      reference,
      mode: sample.mode,
      source_path: entry ? entry.source_path : null,
      status: 'FAIL',
      shape: null,
      failure: null
    };

    if (!entry) {
      item.failure = 'profile entry missing';
    } else if (!entry.source_path || !fs.existsSync(entry.source_path)) {
      item.failure = 'source file missing';
    } else {
      const book = readJson(entry.source_path);
      const resolved = sample.mode === 'whole_psalm'
        ? resolveWholePsalm(book, sample.psalm)
        : resolveChapterVerse(book, sample.chapter, sample.verse);

      if (resolved.ok) {
        item.status = 'PASS';
        item.shape = resolved.shape;
      } else {
        item.failure = resolved.failure;
        item.shape = resolved.shape;
      }
    }

    if (item.status === 'PASS') {
      report.passCount += 1;
    } else {
      report.failCount += 1;
      report.failures.push(`${item.reference}: ${item.failure}`);
    }

    report.samples.push(item);
  }
}

if (report.failCount > 0) report.result = 'FAIL';

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify({
  result: report.result,
  sampleCount: report.sampleCount,
  passCount: report.passCount,
  failCount: report.failCount,
  firstFailures: report.failures.slice(0, 10),
  reportPath
}, null, 2));

if (report.failCount > 0) {
  console.log('ALL FAILED');
  console.log('NEXT: Repair Catholic corpus addressability before moving to LOTH.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Catholic corpus sample addressability is guarded. Continue corpus completion checks before LOTH.');
}
