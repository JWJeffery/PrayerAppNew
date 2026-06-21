import fs from 'fs';
import path from 'path';

const root = process.cwd();
const stamp = new Date().toISOString().replace(/[:.]/g, '');
const reportPath = process.env.NABRE_CORPUS_AUDIT_REPORT || `/tmp/prayerappnew_nabre_corpus_contamination_${stamp}.json`;

const roots = [
  'data/bible/translations/nabre-internal-source-lane/source/generated_data/books',
  'data/bible/OT',
  'data/bible/NT'
];

const patterns = [
  ['chapter_heading', /\bChapter\s+\d+\s+-\s+[A-Z“‘]/],
  ['preamble_heading', /\bPreamble\.\s+[A-Z]/],
  ['psalm_book_heading', /\b(?:First|Second|Third|Fourth|Fifth) Book—Psalms/],
  ['leading_psalm_label', /^(?:\d+:\d+\s+)?Psalm\s+\d+\b/],
  ['roman_section_chapter', /^(?:\d+:\d+\s+)?[IVXLCDM]+\.\s+[A-Z][^.!?]{2,160}\s+Chapter\s+\d+\s+-\s+/],
  ['letter_section_dash', /^(?:\d+:\d+\s+)?[A-Z]\.\s+[A-Z][^.!?]{2,160}\s+-\s+/],
  ['title_dash_opening', /^(?:\d+:\d+\s+)?[A-Z][A-Za-z’'—–,;: ]{3,140}\s+-\s+(?:The|A|An|When|Now|In|Then|Hear|Listen|Thus|Paul|James|Peter|Jude|John)\b/]
];

function listJsonFiles(dir) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  for (const name of fs.readdirSync(abs).sort()) {
    const file = path.join(abs, name);
    if (fs.statSync(file).isFile() && name.endsWith('.json')) out.push(file);
  }
  return out;
}

function rel(file) {
  return path.relative(root, file).replaceAll(path.sep, '/');
}

function chaptersOf(book) {
  return Array.isArray(book?.chapters) ? book.chapters : [];
}

function versesOf(chapter) {
  return Array.isArray(chapter?.verses) ? chapter.verses : [];
}

function chapterNum(chapter) {
  return Number(chapter?.chapter ?? chapter?.num ?? chapter?.number);
}

function verseNum(verse) {
  return Number(verse?.verse ?? verse?.num ?? verse?.number);
}

function testText(text) {
  const raw = String(text || '');
  const unprefixed = raw.replace(/^\d+:\d+\s+/, '');
  for (const [id, re] of patterns) {
    if (re.test(raw) || re.test(unprefixed)) return id;
  }
  return null;
}

const report = {
  result: 'OK',
  repoRoot: root,
  reportPath,
  scannedFiles: 0,
  scannedNabreVerses: 0,
  contaminatedVerses: 0,
  filesWithFindings: 0,
  byPattern: {},
  byFile: {},
  samples: [],
  failures: []
};

function addFinding(file, locator, pattern, text) {
  report.contaminatedVerses += 1;
  report.byPattern[pattern] = (report.byPattern[pattern] || 0) + 1;
  const r = rel(file);
  report.byFile[r] = (report.byFile[r] || 0) + 1;
  if (report.samples.length < 100) {
    report.samples.push({ file: r, locator, pattern, sample: String(text).slice(0, 260) });
  }
}

for (const file of roots.flatMap(listJsonFiles)) {
  report.scannedFiles += 1;
  let json;
  try {
    json = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    report.failures.push({ file: rel(file), error: error.message || String(error) });
    continue;
  }

  const isSourceLane = rel(file).includes('/nabre-internal-source-lane/');
  const bookName = json?.book || json?.meta?.name || path.basename(file, '.json');

  for (const chapter of chaptersOf(json)) {
    const c = chapterNum(chapter);
    for (const verse of versesOf(chapter)) {
      const v = verseNum(verse);
      if (isSourceLane && typeof verse?.text === 'string') {
        report.scannedNabreVerses += 1;
        const pattern = testText(verse.text);
        if (pattern) addFinding(file, `${bookName} ${c}:${v}`, pattern, verse.text);
      } else if (verse?.text && typeof verse.text === 'object' && typeof verse.text.NABRE === 'string') {
        report.scannedNabreVerses += 1;
        const pattern = testText(verse.text.NABRE);
        if (pattern) addFinding(file, `${bookName} ${c}:${v}`, pattern, verse.text.NABRE);
      }
    }
  }
}

report.filesWithFindings = Object.keys(report.byFile).length;
if (report.failures.length || report.contaminatedVerses) report.result = 'FAIL';

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify({
  result: report.result,
  scannedFiles: report.scannedFiles,
  scannedNabreVerses: report.scannedNabreVerses,
  contaminatedVerses: report.contaminatedVerses,
  filesWithFindings: report.filesWithFindings,
  byPattern: report.byPattern,
  firstSamples: report.samples.slice(0, 10),
  failureCount: report.failures.length,
  reportPath
}, null, 2));
console.log(report.result === 'OK' ? 'ALL PASSED' : 'ALL FAILED');
console.log(report.result === 'OK' ? 'NEXT: NABRE corpus scaffold audit is clean.' : `NEXT: inspect ${reportPath}; then run the NABRE repair script.`);
