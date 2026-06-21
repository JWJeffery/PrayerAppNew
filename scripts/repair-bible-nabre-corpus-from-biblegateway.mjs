import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const root = process.cwd();
const stamp = new Date().toISOString().replace(/[:.]/g, '');
const reportPath = process.env.NABRE_REPAIR_REPORT || `/tmp/prayerappnew_nabre_repair_${stamp}.json`;
const sourceDir = path.join(root, 'data/bible/translations/nabre-internal-source-lane/source/generated_data/books');
const integratedDirs = [path.join(root, 'data/bible/OT'), path.join(root, 'data/bible/NT')];
const backupDir = `/tmp/prayerappnew_nabre_repair_backup_${stamp}`;

const report = {
  result: 'FAIL',
  repoRoot: root,
  reportPath,
  backupDir,
  sourceFiles: 0,
  sourceFilesChanged: 0,
  sourceVersesChanged: 0,
  integratedFilesScanned: 0,
  integratedFilesChanged: 0,
  integratedVersesChanged: 0,
  fetchFailures: [],
  parseFailures: [],
  mappingFailures: [],
  changedFiles: [],
  auditAfterRepair: null,
  failures: []
};

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJson(file, value) { fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n'); }
function rel(file) { return path.relative(root, file).replaceAll(path.sep, '/'); }
function listJsonFiles(dir) { return fs.existsSync(dir) ? fs.readdirSync(dir).filter(n => n.endsWith('.json')).sort().map(n => path.join(dir, n)) : []; }
function chaptersOf(book) { return Array.isArray(book?.chapters) ? book.chapters : []; }
function versesOf(chapter) { return Array.isArray(chapter?.verses) ? chapter.verses : []; }
function chapterNum(chapter) { return Number(chapter?.chapter ?? chapter?.num ?? chapter?.number); }
function verseNum(verse) { return Number(verse?.verse ?? verse?.num ?? verse?.number); }
function norm(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function backup(file) { const target = path.join(backupDir, rel(file)); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(file, target); }

function decodeEntities(value) {
  const named = { amp: '&', apos: "'", gt: '>', lt: '<', nbsp: ' ', quot: '"', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', mdash: '—', ndash: '–' };
  return String(value || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#([0-9]+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (_, n) => Object.hasOwn(named, n.toLowerCase()) ? named[n.toLowerCase()] : `&${n};`);
}

function cleanHtml(html) {
  return decodeEntities(String(html || '')
    .replace(/<sup\b[^>]*(?:footnote|crossreference|versenum)[\s\S]*?<\/sup>/gi, ' ')
    .replace(/<span\b[^>]*class=["'][^"']*(?:chapternum|versenum|footnote|crossreference)[^"']*["'][\s\S]*?<\/span>/gi, ' ')
    .replace(/<a\b[^>]*class=["'][^"']*(?:footnote|crossreference)[^"']*["'][\s\S]*?<\/a>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:?!])/g, '$1')
    .trim();
}

function spanClose(html, start) {
  const re = /<\/?span\b[^>]*>/gi;
  re.lastIndex = start;
  let depth = 1;
  let m;
  while ((m = re.exec(html))) {
    if (/^<span\b/i.test(m[0]) && !/\/>$/.test(m[0])) depth += 1;
    if (/^<\/span/i.test(m[0])) depth -= 1;
    if (depth === 0) return { inner: html.slice(start, m.index), end: re.lastIndex };
  }
  return null;
}

function extractVerses(html, chapter) {
  const out = new Map();
  const re = /<span\b[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[0];
    const cm = tag.match(/\bclass=["']([^"']+)["']/i);
    const classes = cm ? cm[1].split(/\s+/) : [];
    if (!classes.includes('text')) continue;
    const verseClass = classes.find(c => /-\d+-\d+(?:-\d+)?$/.test(c));
    if (!verseClass) continue;
    const vm = verseClass.match(/-(\d+)-(\d+)(?:-\d+)?$/);
    if (!vm || Number(vm[1]) !== Number(chapter)) continue;
    const close = spanClose(html, re.lastIndex);
    if (!close) continue;
    const verse = Number(vm[2]);
    const text = cleanHtml(close.inner);
    if (text) out.set(verse, out.has(verse) ? `${out.get(verse)} ${text}`.replace(/\s+/g, ' ').trim() : text);
    re.lastIndex = close.end;
  }
  return out;
}

async function fetchChapter(book, chapter) {
  const url = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(`${book} ${chapter}`)}&version=NABRE&interface=print`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 PrayerAppNew NABRE repair', 'Accept': 'text/html' } });
  const html = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const verses = extractVerses(html, chapter);
  if (!verses.size) throw new Error('no verse spans parsed');
  return verses;
}

function aliases(value) {
  const n = norm(value);
  const map = { songofsolomon: 'songofsongs', canticleofcanticles: 'songofsongs', ecclesiasticus: 'sirach', apocalypse: 'revelation', psalter: 'psalms', psalm: 'psalms' };
  return [...new Set([n, map[n]].filter(Boolean))];
}

function sourceForIntegrated(bookJson, file, sourceMaps) {
  const candidates = [bookJson?.meta?.name, bookJson?.meta?.id, path.basename(file, '.json')].filter(Boolean);
  for (const c of candidates) for (const a of aliases(c)) if (sourceMaps.has(a)) return sourceMaps.get(a);
  return null;
}

async function main() {
  if (!fs.existsSync(sourceDir)) { report.failures.push(`missing source dir: ${sourceDir}`); return; }
  if (typeof fetch !== 'function') { report.failures.push('Node fetch unavailable; use Node 18+'); return; }

  const sourceFiles = listJsonFiles(sourceDir);
  report.sourceFiles = sourceFiles.length;
  if (!sourceFiles.length) { report.failures.push('no NABRE source book files found'); return; }

  const sourceUpdates = new Map();
  const sourceMaps = new Map();

  for (const file of sourceFiles) {
    const json = readJson(file);
    const book = json.book || path.basename(file, '.json');
    const bookMap = new Map();
    let changed = 0;

    for (const chapter of chaptersOf(json)) {
      const c = chapterNum(chapter);
      let clean;
      try { clean = await fetchChapter(book, c); }
      catch (error) { report.fetchFailures.push({ file: rel(file), book, chapter: c, error: error.message || String(error) }); continue; }

      const expected = versesOf(chapter).map(verseNum).filter(Number.isFinite);
      const missing = expected.filter(v => !clean.has(v));
      if (missing.length) { report.parseFailures.push({ file: rel(file), book, chapter: c, missing }); continue; }

      const chapterMap = new Map();
      for (const verse of versesOf(chapter)) {
        const v = verseNum(verse);
        const next = clean.get(v);
        if (!next) continue;
        chapterMap.set(v, next);
        if (verse.text !== next) { verse.text = next; changed += 1; }
      }
      bookMap.set(c, chapterMap);
      await new Promise(resolve => setTimeout(resolve, 75));
    }

    sourceMaps.set(norm(book), { book, map: bookMap });
    if (changed) { sourceUpdates.set(file, json); report.sourceFilesChanged += 1; report.sourceVersesChanged += changed; }
  }

  if (report.fetchFailures.length || report.parseFailures.length) { report.failures.push('source rebuild incomplete; no files written'); return; }

  const integratedUpdates = new Map();
  for (const file of integratedDirs.flatMap(listJsonFiles)) {
    report.integratedFilesScanned += 1;
    const json = readJson(file);
    const source = sourceForIntegrated(json, file, sourceMaps);
    let hasNabre = false;
    let changed = 0;

    for (const chapter of chaptersOf(json)) for (const verse of versesOf(chapter)) if (verse?.text && typeof verse.text === 'object' && typeof verse.text.NABRE === 'string') hasNabre = true;
    if (!hasNabre) continue;
    if (!source) { report.mappingFailures.push({ file: rel(file), book: json?.meta?.name || path.basename(file, '.json') }); continue; }

    for (const chapter of chaptersOf(json)) {
      const c = chapterNum(chapter);
      const cm = source.map.get(c);
      if (!cm) continue;
      for (const verse of versesOf(chapter)) {
        if (!verse?.text || typeof verse.text !== 'object' || typeof verse.text.NABRE !== 'string') continue;
        const v = verseNum(verse);
        const clean = cm.get(v);
        if (!clean) continue;
        const prefix = (verse.text.NABRE.match(/^\s*\d+:\d+\s+/) || [''])[0];
        const next = `${prefix}${clean}`.trim();
        if (verse.text.NABRE !== next) { verse.text.NABRE = next; changed += 1; }
      }
    }
    if (changed) { integratedUpdates.set(file, json); report.integratedFilesChanged += 1; report.integratedVersesChanged += changed; }
  }

  if (report.mappingFailures.length) { report.failures.push('integrated NABRE mappings missing; no files written'); return; }

  fs.mkdirSync(backupDir, { recursive: true });
  for (const [file, json] of [...sourceUpdates, ...integratedUpdates]) { backup(file); writeJson(file, json); report.changedFiles.push(rel(file)); }

  const audit = spawnSync(process.execPath, ['scripts/audit-bible-nabre-corpus-contamination.mjs'], { cwd: root, encoding: 'utf8', env: process.env });
  report.auditAfterRepair = { status: audit.status, stdout: audit.stdout.slice(-4000), stderr: audit.stderr.slice(-4000) };
  if (!/ALL PASSED/.test(audit.stdout)) { report.failures.push('post-repair NABRE contamination audit did not pass'); return; }

  report.result = 'OK';
}

try { await main(); }
catch (error) { report.failures.push(error.stack || error.message || String(error)); }

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({
  result: report.result,
  sourceFiles: report.sourceFiles,
  sourceFilesChanged: report.sourceFilesChanged,
  sourceVersesChanged: report.sourceVersesChanged,
  integratedFilesScanned: report.integratedFilesScanned,
  integratedFilesChanged: report.integratedFilesChanged,
  integratedVersesChanged: report.integratedVersesChanged,
  fetchFailureCount: report.fetchFailures.length,
  parseFailureCount: report.parseFailures.length,
  mappingFailureCount: report.mappingFailures.length,
  changedFileCount: report.changedFiles.length,
  firstFailures: report.failures.slice(0, 10),
  backupDir,
  reportPath
}, null, 2));
console.log(report.result === 'OK' ? 'ALL PASSED' : 'ALL FAILED');
console.log(report.result === 'OK' ? 'NEXT: review git diff, run app smoke, then commit NABRE corpus repair.' : `NEXT: inspect ${reportPath}; no files were written unless fetch/parse/mapping completed.`);
