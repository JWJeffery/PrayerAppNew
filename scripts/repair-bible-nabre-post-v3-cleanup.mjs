import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const root = process.cwd();
const stamp = new Date().toISOString().replace(/[:.]/g, '');
const reportPath = process.env.NABRE_POST_V3_CLEANUP_REPORT || `/tmp/prayerappnew_nabre_post_v3_cleanup_${stamp}.json`;
const backupDir = `/tmp/prayerappnew_nabre_post_v3_cleanup_backup_${stamp}`;
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
  genesisPreambleFixes: 0,
  psalmHeadingFixes: 0,
  failures: [],
  auditAfterCleanup: null
};

function rel(file) {
  return path.relative(root, file).replaceAll(path.sep, '/');
}

function listJsonFiles(dir) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs).filter(name => name.endsWith('.json')).sort().map(name => path.join(abs, name));
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}

function backup(file) {
  const target = path.join(backupDir, rel(file));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(file, target);
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

function norm(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function bookNameFor(json, file) {
  return json?.book || json?.meta?.name || path.basename(file, '.json');
}

const PSALM_SUPERSCRIPTION_BOUNDARIES = [
  'For the leader', 'For Jeduthun', 'According to', 'A psalm', 'Of David', 'Of Solomon', 'Of Asaph',
  'Of the Korahites', 'A maskil', 'A miktam', 'A shiggaion', 'A song', 'A prayer', 'A plaintive song',
  'A song of ascents', 'A sabbath psalm', 'A song for the dedication', 'A psalm of David'
];

const PSALM_TEXT_BOUNDARIES = [
  'Blessed ', 'Happy ', 'Why ', 'Lord, ', 'The Lord ', 'The Lord’s ', 'In you', 'To you', 'Keep me',
  'Preserve me', 'Judge me', 'Give ', 'Have mercy', 'Not to us', 'When ', 'Unless ', 'Out of ',
  'By the rivers', 'Praise ', 'Hallelujah', 'Sing ', 'God ', 'My God', 'O God', 'How ', 'May ',
  'Save me', 'Hear ', 'Come ', 'Help ', 'You ', 'Those ', 'Do not ', 'Let ', 'I love', 'I raise',
  'I will', 'I praise', 'I thank', 'I waited', 'I cried', 'I call', 'I rejoiced', 'I was glad',
  'A clean heart', 'The fool', 'The earth', 'The heavens', 'Answer me', 'Have pity', 'O shepherd',
  'Shout joyfully', 'Give thanks', 'The Mighty One', 'All you peoples', 'Great is the Lord',
  'Whoever dwells', 'It is good', 'The Lord is king', 'Come, let us sing'
];

const LEADING_MARKER_RE = /^(?:I|II|III|IV|V|VI|VII|VIII|IX|X|A|B|C|D|Aleph|Beth|Gimel|Daleth|He|Waw|Zayin|Heth|Teth|Yodh|Kaph|Lamedh|Mem|Nun|Samekh|Ayin|Pe|Tsade|Qoph|Resh|Shin|Taw)\s+/;
const INLINE_MARKER_RE = /([.!?])\s+(?:I|II|III|IV|V|VI|VII|VIII|IX|X|A|B|C|D|Aleph|Beth|Gimel|Daleth|He|Waw|Zayin|Heth|Teth|Yodh|Kaph|Lamedh|Mem|Nun|Samekh|Ayin|Pe|Tsade|Qoph|Resh|Shin|Taw)\s+(?=[A-Z“])/g;

function earliestBoundaryIndex(text, boundaries) {
  let best = -1;
  for (const boundary of boundaries) {
    const idx = text.indexOf(boundary);
    if (idx >= 0 && (best < 0 || idx < best)) best = idx;
  }
  return best;
}

function cleanPsalmOpening(body, psalmNo) {
  const label = new RegExp(`^Psalm\\s+${psalmNo}\\b\\s*`, 'i');
  if (!label.test(body)) return body;

  let next = body.replace(label, '').trim();
  const superscriptionIdx = earliestBoundaryIndex(next, PSALM_SUPERSCRIPTION_BOUNDARIES);
  if (superscriptionIdx > 0) {
    next = next.slice(superscriptionIdx).trim();
  } else if (superscriptionIdx < 0) {
    const textIdx = earliestBoundaryIndex(next, PSALM_TEXT_BOUNDARIES);
    if (textIdx > 0) next = next.slice(textIdx).trim();
  }

  next = next.replace(LEADING_MARKER_RE, '').trim();
  next = next.replace(INLINE_MARKER_RE, '$1 ').replace(/\s+/g, ' ').trim();
  return next;
}

function cleanBody(body, book, chapter, verse) {
  let next = String(body || '');

  if (norm(book) === 'genesis' && Number(chapter) === 1 && Number(verse) === 1) {
    const cleaned = next.replace(/^Preamble\.\s+The Creation of the World\s+Chapter\s+1\s+(?:-\s*)?The Story of Creation\.\s*/i, '').trim();
    if (cleaned !== next) {
      next = cleaned;
      report.genesisPreambleFixes += 1;
    }
  }

  if (norm(book) === 'psalms' && Number(verse) === 1) {
    const cleaned = cleanPsalmOpening(next, Number(chapter));
    if (cleaned !== next) {
      next = cleaned;
      report.psalmHeadingFixes += 1;
    }
  }

  return next;
}

function cleanText(text, book, chapter, verse) {
  const original = String(text || '');
  const match = original.match(/^(\s*\d+:\d+\s+)([\s\S]*)$/);
  if (match) return match[1] + cleanBody(match[2], book, chapter, verse);
  return cleanBody(original, book, chapter, verse);
}

function cleanVerseText(verse, book, chapter) {
  const v = verseNum(verse);
  if (typeof verse?.text === 'string') {
    const next = cleanText(verse.text, book, chapter, v);
    if (next !== verse.text) {
      verse.text = next;
      return true;
    }
  } else if (verse?.text && typeof verse.text === 'object' && typeof verse.text.NABRE === 'string') {
    const next = cleanText(verse.text.NABRE, book, chapter, v);
    if (next !== verse.text.NABRE) {
      verse.text.NABRE = next;
      return true;
    }
  }
  return false;
}

fs.mkdirSync(backupDir, { recursive: true });

for (const file of roots.flatMap(listJsonFiles)) {
  report.scannedFiles += 1;
  let json;
  try {
    json = readJson(file);
  } catch (error) {
    report.failures.push({ file: rel(file), error: error.message || String(error) });
    continue;
  }

  const book = bookNameFor(json, file);
  let changed = false;
  for (const chapter of chaptersOf(json)) {
    const c = chapterNum(chapter);
    for (const verse of versesOf(chapter)) {
      if (cleanVerseText(verse, book, c)) {
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

const audit = spawnSync(process.execPath, ['scripts/audit-bible-nabre-corpus-contamination.mjs'], { cwd: root, encoding: 'utf8', env: { ...process.env, NABRE_CORPUS_AUDIT_REPORT: `/tmp/prayerappnew_nabre_post_v3_cleanup_audit_${stamp}.json` } });
report.auditAfterCleanup = { status: audit.status, stdout: audit.stdout.slice(-5000), stderr: audit.stderr.slice(-5000) };
if (!/ALL PASSED/.test(audit.stdout)) {
  report.failures.push('post-v3 residual cleanup audit did not pass');
} else {
  report.result = 'OK';
}

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({
  result: report.result,
  scannedFiles: report.scannedFiles,
  changedFileCount: report.changedFiles.length,
  changedVerses: report.changedVerses,
  genesisPreambleFixes: report.genesisPreambleFixes,
  psalmHeadingFixes: report.psalmHeadingFixes,
  firstChangedFiles: report.changedFiles.slice(0, 20),
  firstFailures: report.failures.slice(0, 10),
  auditTail: report.auditAfterCleanup?.stdout,
  reportPath,
  backupDir
}, null, 2));
console.log(report.result === 'OK' ? 'ALL PASSED' : 'ALL FAILED');
console.log(report.result === 'OK' ? 'NEXT: run git diff --stat and inspect Genesis/Psalms NABRE samples.' : `NEXT: inspect ${reportPath}; current working tree has post-v3 modifications plus this cleanup attempt.`);
