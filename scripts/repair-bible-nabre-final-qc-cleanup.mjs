import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const root = process.cwd();
const stamp = new Date().toISOString().replace(/[:.]/g, '');
const reportPath = process.env.NABRE_FINAL_QC_REPORT || `/tmp/prayerappnew_nabre_final_qc_cleanup_${stamp}.json`;
const backupDir = `/tmp/prayerappnew_nabre_final_qc_cleanup_backup_${stamp}`;
const roots = [
  'data/bible/translations/nabre-internal-source-lane/source/generated_data/books',
  'data/bible/OT',
  'data/bible/NT'
];

const report = {
  result: 'FAIL',
  reportPath,
  backupDir,
  scannedFiles: 0,
  changedFiles: [],
  changedVerses: 0,
  letterOfJeremiahFixes: 0,
  psalmArticleFixes: 0,
  qcFailures: [],
  auditAfterCleanup: null
};

function rel(file) { return path.relative(root, file).replaceAll(path.sep, '/'); }
function listJsonFiles(dir) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs).filter(n => n.endsWith('.json')).sort().map(n => path.join(abs, n));
}
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJson(file, value) { fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n'); }
function backup(file) { const target = path.join(backupDir, rel(file)); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(file, target); }
function chaptersOf(book) { return Array.isArray(book?.chapters) ? book.chapters : []; }
function versesOf(chapter) { return Array.isArray(chapter?.verses) ? chapter.verses : []; }
function chapterNum(chapter) { return Number(chapter?.chapter ?? chapter?.num ?? chapter?.number); }
function verseNum(verse) { return Number(verse?.verse ?? verse?.num ?? verse?.number); }
function norm(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function bookNameFor(json, file) { return json?.book || json?.meta?.name || path.basename(file, '.json'); }
function isNabreSource(file) { return rel(file).includes('/nabre-internal-source-lane/'); }

function splitPrefix(text) {
  const m = String(text || '').match(/^(\s*\d+:\d+\s+)([\s\S]*)$/);
  return m ? [m[1], m[2]] : ['', String(text || '')];
}

function cleanBody(body, book, chapter, verse) {
  let next = String(body || '');

  if ((norm(book) === 'baruch' && Number(chapter) === 6 && Number(verse) === 1) ||
      (norm(book) === 'theletterofjeremiah' && Number(chapter) === 1 && Number(verse) === 1) ||
      (norm(book) === 'letterofjeremiah' && Number(chapter) === 1 && Number(verse) === 1)) {
    const cleaned = next
      .replace(/^(?:IV\.\s*)?Letter of Jeremiah\s+Chapter\s+6\s+(?:-\s*)?/i, '')
      .replace(/^(?:IV\.\s*)?Letter of Jeremiah\s+/i, '')
      .trim();
    if (cleaned !== next) {
      next = cleaned;
      report.letterOfJeremiahFixes += 1;
    }
  }

  if (norm(book) === 'psalms' && Number(verse) === 1) {
    const cleaned = next.replace(/^(psalm|song|prayer|plaintive song|maskil|miktam|shiggaion)\b/i, match => {
      if (/^(?:a|an|the)\b/i.test(match)) return match;
      return `A ${match}`;
    });
    if (cleaned !== next) {
      next = cleaned;
      report.psalmArticleFixes += 1;
    }
  }

  return next;
}

function cleanTextValue(text, book, chapter, verse) {
  const [prefix, body] = splitPrefix(text);
  return prefix + cleanBody(body, book, chapter, verse);
}

function cleanVerse(verse, book, chapter) {
  const v = verseNum(verse);
  if (typeof verse?.text === 'string') {
    const next = cleanTextValue(verse.text, book, chapter, v);
    if (next !== verse.text) { verse.text = next; return true; }
  } else if (verse?.text && typeof verse.text === 'object' && typeof verse.text.NABRE === 'string') {
    const next = cleanTextValue(verse.text.NABRE, book, chapter, v);
    if (next !== verse.text.NABRE) { verse.text.NABRE = next; return true; }
  }
  return false;
}

function findVerse(json, chapter, verse) {
  const ch = chaptersOf(json).find(c => chapterNum(c) === Number(chapter));
  return versesOf(ch).find(v => verseNum(v) === Number(verse));
}

function textFor(json, chapter, verse) {
  const v = findVerse(json, chapter, verse);
  if (typeof v?.text === 'string') return v.text;
  if (v?.text && typeof v.text === 'object') return v.text.NABRE;
  return undefined;
}

fs.mkdirSync(backupDir, { recursive: true });

for (const file of roots.flatMap(listJsonFiles)) {
  report.scannedFiles += 1;
  const json = readJson(file);
  const book = bookNameFor(json, file);
  let changed = false;

  for (const chapter of chaptersOf(json)) {
    const c = chapterNum(chapter);
    for (const verse of versesOf(chapter)) {
      if (cleanVerse(verse, book, c)) {
        changed = true;
        report.changedVerses += 1;
      }
    }
  }

  if (changed) {
    backup(file);
    writeJson(file, json);
    report.changedFiles.push(rel(file));
  }
}

const audit = spawnSync(process.execPath, ['scripts/audit-bible-nabre-corpus-contamination.mjs'], {
  cwd: root,
  encoding: 'utf8',
  env: { ...process.env, NABRE_CORPUS_AUDIT_REPORT: `/tmp/prayerappnew_nabre_final_qc_audit_${stamp}.json` }
});
report.auditAfterCleanup = { status: audit.status, stdout: audit.stdout.slice(-5000), stderr: audit.stderr.slice(-5000) };
if (!/ALL PASSED/.test(audit.stdout)) report.qcFailures.push('contamination audit failed after final QC cleanup');

for (const file of roots.flatMap(listJsonFiles)) {
  const json = readJson(file);
  const book = bookNameFor(json, file);
  const n = norm(book);

  if (n === 'psalms') {
    for (const psalm of [23]) {
      const t = textFor(json, psalm, 1);
      if (typeof t === 'string') {
        const [, body] = splitPrefix(t);
        if (/^psalm\b/.test(body)) report.qcFailures.push({ file: rel(file), locator: `${book} ${psalm}:1`, error: 'lowercase psalm superscription missing article', sample: t.slice(0, 200) });
        if (/^Psalm\s+\d+\b/.test(body)) report.qcFailures.push({ file: rel(file), locator: `${book} ${psalm}:1`, error: 'Psalm label remains', sample: t.slice(0, 200) });
      }
    }
  }

  if ((n === 'baruch' || n === 'theletterofjeremiah' || n === 'letterofjeremiah')) {
    const t = n === 'baruch' ? textFor(json, 6, 1) : textFor(json, 1, 1);
    if (typeof t === 'string' && /Letter of Jeremiah\s+Chapter\s+6|IV\.\s+Letter of Jeremiah/i.test(t)) {
      report.qcFailures.push({ file: rel(file), locator: n === 'baruch' ? `${book} 6:1` : `${book} 1:1`, error: 'Letter of Jeremiah scaffold remains', sample: t.slice(0, 240) });
    }
  }
}

if (!report.qcFailures.length) report.result = 'OK';

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({
  result: report.result,
  scannedFiles: report.scannedFiles,
  changedFileCount: report.changedFiles.length,
  changedVerses: report.changedVerses,
  letterOfJeremiahFixes: report.letterOfJeremiahFixes,
  psalmArticleFixes: report.psalmArticleFixes,
  firstChangedFiles: report.changedFiles.slice(0, 20),
  qcFailures: report.qcFailures.slice(0, 20),
  auditTail: report.auditAfterCleanup?.stdout,
  reportPath,
  backupDir
}, null, 2));
console.log(report.result === 'OK' ? 'ALL PASSED' : 'ALL FAILED');
console.log(report.result === 'OK' ? 'NEXT: run final sample inspection, then commit.' : `NEXT: inspect ${reportPath}; do not commit until QC failures are resolved.`);
