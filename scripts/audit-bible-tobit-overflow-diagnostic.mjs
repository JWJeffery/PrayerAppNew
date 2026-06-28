#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';

const activePath = 'data/bible/OT/tobit.json';
const drbPath = 'data/bible/translations/drb-original-douay-rheims/raw/tobias.json';
const ref = 'd0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6';
const sources = {
  KJV: 'data/bible/translations/kjv-1611/source/aruljohn-bible-kjv-1611/Tobit.json',
  NABRE: 'data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Tobit.json'
};
const reportPath = process.env.TOBIT_OVERFLOW_DIAGNOSTIC_REPORT || null;
const failures = [];

function read(path) {
  try { return JSON.parse(fs.readFileSync(path, 'utf8')); }
  catch (error) { failures.push({ type: 'read-failed', path, error: String(error.message || error) }); return null; }
}

function hist(path) {
  const got = spawnSync('git', ['show', `${ref}:${path}`], { encoding: 'utf8' });
  if (got.status !== 0) { failures.push({ type: 'git-show-failed', path, stderr: String(got.stderr || '').trim() }); return null; }
  try { return JSON.parse(got.stdout); }
  catch (error) { failures.push({ type: 'parse-failed', path, error: String(error.message || error) }); return null; }
}

function n(value) { const out = Number.parseInt(String(value), 10); return Number.isFinite(out) ? out : null; }
function chNum(ch, i) { return n(ch?.number ?? ch?.num ?? ch?.chapter) ?? i + 1; }
function vNum(v, i) { return n(v?.number ?? v?.num ?? v?.verse) ?? i + 1; }
function hash(text) { return crypto.createHash('sha256').update(String(text)).digest('hex').slice(0, 16); }
function laneText(row, lane = null) {
  if (!row || typeof row !== 'object') return null;
  if (typeof row.text === 'string') return row.text;
  if (row.text && typeof row.text === 'object' && !Array.isArray(row.text)) {
    if (lane && typeof row.text[lane] === 'string') return row.text[lane];
    for (const key of ['KJV', 'NABRE', 'DRB', 'NRSV', 'rawText', 'Rotherham']) if (typeof row.text[key] === 'string') return row.text[key];
  }
  return null;
}

function rows(book, lane = null) {
  const out = [];
  for (const [ci, ch] of (book?.chapters || []).entries()) {
    const c = chNum(ch, ci);
    for (const [vi, verse] of (ch?.verses || []).entries()) {
      const v = vNum(verse, vi);
      const text = laneText(verse, lane);
      if (typeof text === 'string' && text.trim()) out.push({ ref: `${c}:${v}`, chapter: c, verse: v, text, row: verse });
    }
  }
  return out;
}

function mapRows(book, lane = null) { return new Map(rows(book, lane).map((row) => [row.ref, row])); }
function activeRowMap(book) {
  const out = new Map();
  for (const row of rows(book)) out.set(row.ref, row);
  return out;
}

function compare(active, lane, source) {
  const activeMap = mapRows(active, lane);
  const sourceMap = mapRows(source);
  const extra = [...activeMap.keys()].filter((r) => !sourceMap.has(r));
  const missing = [...sourceMap.keys()].filter((r) => !activeMap.has(r));
  const mismatched = [...sourceMap.keys()].filter((r) => activeMap.has(r) && activeMap.get(r).text !== sourceMap.get(r).text);
  return { activeMap, sourceMap, extra, missing, mismatched };
}

function classifyExtra(active, lane, refs) {
  const allRows = activeRowMap(active);
  return refs.map((r) => {
    const row = allRows.get(r)?.row;
    const text = laneText(row, lane) || '';
    const otherLaneMatches = {};
    for (const other of ['NRSV', 'DRB', 'rawText', 'Rotherham']) {
      const otherText = laneText(row, other);
      otherLaneMatches[other] = typeof otherText === 'string' && otherText === text;
    }
    return { ref: r, textHash: hash(text), textLength: text.length, otherLaneMatches };
  });
}

const active = read(activePath);
const drb = read(drbPath);
const kjv = hist(sources.KJV);
const nabre = hist(sources.NABRE);
const report = {
  audit: 'tobit-overflow-diagnostic',
  status: failures.length ? 'failed' : 'classified',
  bibleTextMutation: false,
  activePath,
  diagnostics: {},
  failures
};

if (active && drb && kjv && nabre) {
  for (const [lane, source] of [['KJV', kjv], ['NABRE', nabre], ['DRB', drb]]) {
    const c = compare(active, lane, source);
    report.diagnostics[lane] = {
      sourceRows: c.sourceMap.size,
      activeRows: c.activeMap.size,
      exactSourceRefs: c.sourceMap.size - c.missing.length - c.mismatched.length,
      missingCount: c.missing.length,
      mismatchCount: c.mismatched.length,
      extraActiveCount: c.extra.length,
      missingRefs: c.missing,
      mismatchRefs: c.mismatched,
      extraActiveRefs: c.extra,
      extraActiveClassified: classifyExtra(active, lane, c.extra)
    };
  }

  const drbDiag = report.diagnostics.DRB;
  const activeDrb = mapRows(active, 'DRB');
  const sourceDrb = mapRows(drb);
  drbDiag.movedTextCandidates = [];
  for (const missingRef of drbDiag.missingRefs) {
    const sourceText = sourceDrb.get(missingRef)?.text;
    for (const extraRef of drbDiag.extraActiveRefs) {
      const activeText = activeDrb.get(extraRef)?.text;
      if (sourceText && activeText && sourceText === activeText) {
        drbDiag.movedTextCandidates.push({ sourceRef: missingRef, activeRef: extraRef, textHash: hash(sourceText), textLength: sourceText.length });
      }
    }
  }
}

if (reportPath) fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Diagnostic failed to read one or more inputs.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Use diagnostic classification to decide Tobit overflow/source-address policy before any text mutation.');
}
