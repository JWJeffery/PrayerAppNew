import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const root = process.cwd();
const stamp = new Date().toISOString().replace(/[:.]/g, '');
const reportPath = process.env.NABRE_REPAIR_REPORT || `/tmp/prayerappnew_nabre_repair_v2_${stamp}.json`;
const backupDir = `/tmp/prayerappnew_nabre_repair_v2_backup_${stamp}`;
const sourceDir = path.join(root, 'data/bible/translations/nabre-internal-source-lane/source/generated_data/books');
const integratedDirs = [path.join(root, 'data/bible/OT'), path.join(root, 'data/bible/NT')];

const report = {
  result: 'FAIL', reportPath, backupDir,
  sourceFiles: 0, sourceFilesChanged: 0, sourceVersesChanged: 0,
  integratedFilesScanned: 0, integratedFilesChanged: 0, integratedVersesChanged: 0,
  allowedFallbacks: [], fetchFailures: [], parseFailures: [], mappingFailures: [], changedFiles: [], failures: []
};

function readJson(f) { return JSON.parse(fs.readFileSync(f, 'utf8')); }
function writeJson(f, x) { fs.writeFileSync(f, JSON.stringify(x, null, 2) + '\n'); }
function rel(f) { return path.relative(root, f).replaceAll(path.sep, '/'); }
function norm(x) { return String(x || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function listJsonFiles(dir) { return fs.existsSync(dir) ? fs.readdirSync(dir).filter(n => n.endsWith('.json')).sort().map(n => path.join(dir, n)) : []; }
function chaptersOf(x) { return Array.isArray(x?.chapters) ? x.chapters : []; }
function versesOf(x) { return Array.isArray(x?.verses) ? x.verses : []; }
function chapterNum(x) { return Number(x?.chapter ?? x?.num ?? x?.number); }
function verseNum(x) { return Number(x?.verse ?? x?.num ?? x?.number); }
function backup(f) { const t = path.join(backupDir, rel(f)); fs.mkdirSync(path.dirname(t), { recursive: true }); fs.copyFileSync(f, t); }

function decodeEntities(x) {
  const named = { amp: '&', apos: "'", gt: '>', lt: '<', nbsp: ' ', quot: '"', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', mdash: '—', ndash: '–' };
  return String(x || '').replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#([0-9]+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10))).replace(/&([a-z]+);/gi, (_, n) => Object.hasOwn(named, n.toLowerCase()) ? named[n.toLowerCase()] : `&${n};`);
}

function cleanHtml(html) {
  return decodeEntities(String(html || '').replace(/<sup\b[^>]*(?:footnote|crossreference|versenum)[\s\S]*?<\/sup>/gi, ' ').replace(/<span\b[^>]*class=["'][^"']*(?:chapternum|versenum|footnote|crossreference)[^"']*["'][\s\S]*?<\/span>/gi, ' ').replace(/<a\b[^>]*class=["'][^"']*(?:footnote|crossreference)[^"']*["'][\s\S]*?<\/a>/gi, ' ').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').replace(/\s+([,.;:?!])/g, '$1').trim();
}

function spanClose(html, start) {
  const re = /<\/?span\b[^>]*>/gi;
  re.lastIndex = start;
  let depth = 1, m;
  while ((m = re.exec(html))) {
    if (/^<span\b/i.test(m[0]) && !/\/>$/.test(m[0])) depth += 1;
    if (/^<\/span/i.test(m[0])) depth -= 1;
    if (depth === 0) return { inner: html.slice(start, m.index), end: re.lastIndex };
  }
  return null;
}

function verseRefs(classes, wantedChapter) {
  const out = [];
  for (const c of classes) {
    const m = c.match(/-(\d+)-(\d+)(?:-\d+)?$/);
    if (m && Number(m[1]) === Number(wantedChapter)) out.push(Number(m[2]));
  }
  return [...new Set(out)].sort((a, b) => a - b);
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
    const refs = verseRefs(classes, chapter);
    if (!refs.length) continue;
    const close = spanClose(html, re.lastIndex);
    if (!close) continue;
    const text = cleanHtml(close.inner);
    for (const v of refs) if (text) out.set(v, out.has(v) ? `${out.get(v)} ${text}`.replace(/\s+/g, ' ').trim() : text);
    re.lastIndex = close.end;
  }
  return out;
}

async function fetchChapter(book, chapter) {
  const url = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(`${book} ${chapter}`)}&version=NABRE&interface=print`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 PrayerAppNew NABRE repair', Accept: 'text/html' } });
  const html = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const verses = extractVerses(html, chapter);
  if (!verses.size) throw new Error('no verse spans parsed');
  return verses;
}

function allowedFallbackText(book, chapter, verse, current) {
  if (norm(book) !== 'sirach') return null;
  const c = Number(chapter), v = Number(verse);
  if (c === 33 && v === 20) return current;
  if (c === 47 && v === 9) return current;
  if (c === 41 && v === 20) return current;
  if (c === 41 && v === 14) return String(current || '').replace(/^True and False Shame\s+-\s+/, '').trim();
  return null;
}

function sourceAliases(x) {
  const n = norm(x);
  const map = { songofsolomon: 'songofsongs', canticleofcanticles: 'songofsongs', ecclesiasticus: 'sirach', apocalypse: 'revelation', psalm: 'psalms', psalter: 'psalms' };
  return [...new Set([n, map[n]].filter(Boolean))];
}

function sourceForIntegrated(bookJson, file, sourceMaps) {
  for (const c of [bookJson?.meta?.name, bookJson?.meta?.id, path.basename(file, '.json')].filter(Boolean)) {
    for (const a of sourceAliases(c)) if (sourceMaps.has(a)) return sourceMaps.get(a);
  }
  return null;
}

async function main() {
  if (!fs.existsSync(sourceDir)) { report.failures.push(`missing source dir: ${sourceDir}`); return; }
  if (typeof fetch !== 'function') { report.failures.push('Node fetch unavailable; use Node 18+'); return; }

  const sourceFiles = listJsonFiles(sourceDir);
  report.sourceFiles = sourceFiles.length;
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
      catch (e) { report.fetchFailures.push({ file: rel(file), book, chapter: c, error: e.message || String(e) }); continue; }

      const missing = [];
      const chapterMap = new Map();
      for (const verse of versesOf(chapter)) {
        const v = verseNum(verse);
        let next = clean.get(v);
        if (!next) {
          next = allowedFallbackText(book, c, v, verse.text);
          if (next) report.allowedFallbacks.push({ file: rel(file), book, chapter: c, verse: v });
        }
        if (!next) { missing.push(v); continue; }
        chapterMap.set(v, next);
        if (verse.text !== next) { verse.text = next; changed += 1; }
      }
      if (missing.length) report.parseFailures.push({ file: rel(file), book, chapter: c, missing });
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
    let hasNabre = false, changed = 0;
    for (const ch of chaptersOf(json)) for (const v of versesOf(ch)) if (v?.text && typeof v.text === 'object' && typeof v.text.NABRE === 'string') hasNabre = true;
    if (!hasNabre) continue;
    const source = sourceForIntegrated(json, file, sourceMaps);
    if (!source) { report.mappingFailures.push({ file: rel(file), book: json?.meta?.name || path.basename(file, '.json') }); continue; }

    for (const ch of chaptersOf(json)) {
      const c = chapterNum(ch);
      const cm = source.map.get(c);
      if (!cm) continue;
      for (const verse of versesOf(ch)) {
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

try { await main(); } catch (e) { report.failures.push(e.stack || e.message || String(e)); }
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ result: report.result, sourceFiles: report.sourceFiles, sourceFilesChanged: report.sourceFilesChanged, sourceVersesChanged: report.sourceVersesChanged, integratedFilesScanned: report.integratedFilesScanned, integratedFilesChanged: report.integratedFilesChanged, integratedVersesChanged: report.integratedVersesChanged, allowedFallbacks: report.allowedFallbacks, fetchFailureCount: report.fetchFailures.length, parseFailureCount: report.parseFailures.length, mappingFailureCount: report.mappingFailures.length, changedFileCount: report.changedFiles.length, firstFailures: report.failures.slice(0, 10), reportPath, backupDir }, null, 2));
console.log(report.result === 'OK' ? 'ALL PASSED' : 'ALL FAILED');
console.log(report.result === 'OK' ? 'NEXT: review git diff --stat and inspect changed NABRE files.' : `NEXT: inspect ${reportPath}; no files were written unless final write stage was reached.`);
