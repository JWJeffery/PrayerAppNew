import fs from 'fs';

const manifestPath = 'data/bible/translations/drb-original-douay-rheims/manifest.json';
const reportPath = process.env.DRB_SOURCE_LANE_AUDIT_REPORT || '/tmp/bible-drb-original-source-lane-audit.json';

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const report = {
  result: 'OK',
  manifestPath,
  bookCount: 0,
  totalChapterCount: 0,
  totalVerseCount: 0,
  invalidBookCount: 0,
  firstInvalidBooks: []
};

if (!fs.existsSync(manifestPath)) {
  report.result = 'FAIL';
  report.failure = 'manifest missing';
} else {
  const manifest = readJson(manifestPath);
  const books = Array.isArray(manifest.books) ? manifest.books : [];

  report.bookCount = books.length;
  report.totalChapterCount = Number(manifest.total_chapter_count || 0);
  report.totalVerseCount = Number(manifest.total_verse_count || 0);

  for (const book of books) {
    const file = `data/bible/translations/drb-original-douay-rheims/${book.file}`;
    if (!fs.existsSync(file)) {
      report.invalidBookCount += 1;
      if (report.firstInvalidBooks.length < 10) report.firstInvalidBooks.push({ file, reason: 'missing file' });
      continue;
    }

    const json = readJson(file);
    const chapters = Array.isArray(json.chapters) ? json.chapters : [];
    let verses = 0;

    for (const chapter of chapters) {
      if (!Array.isArray(chapter.verses)) continue;
      for (const verse of chapter.verses) {
        if (typeof verse.text === 'string' && verse.text.trim()) verses += 1;
      }
    }

    if (chapters.length === 0 || verses === 0) {
      report.invalidBookCount += 1;
      if (report.firstInvalidBooks.length < 10) {
        report.firstInvalidBooks.push({ file, reason: 'no usable chapter/verse text' });
      }
    }
  }

  if (report.bookCount < 73 || report.invalidBookCount > 0 || report.totalVerseCount < 30000) {
    report.result = 'FAIL';
  }
}

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify({
  result: report.result,
  bookCount: report.bookCount,
  totalChapterCount: report.totalChapterCount,
  totalVerseCount: report.totalVerseCount,
  invalidBookCount: report.invalidBookCount,
  firstInvalidBooks: report.firstInvalidBooks,
  reportPath
}, null, 2));

if (report.result !== 'OK') {
  console.log('ALL FAILED');
  console.log('NEXT: DRB preserved source lane is not complete.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: DRB preserved source lane is complete. Use this lane for DRB rather than fake verse-grid parity.');
}
