#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const activePath = 'data/bible/OT/tobit.json';
const drbPath = 'data/bible/translations/drb-original-douay-rheims/raw/tobias.json';
const ref = 'd0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6';
const kjvPath = 'data/bible/translations/kjv-1611/source/aruljohn-bible-kjv-1611/Tobit.json';
const nabrePath = 'data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Tobit.json';
const reportPath = process.env.TOBIT_BOUND_SOURCE_STATUS_REPORT || null;
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

function n(v) { const out = Number.parseInt(String(v), 10); return Number.isFinite(out) ? out : null; }
function chNum(ch, i) { return n(ch?.number ?? ch?.num ?? ch?.chapter) ?? i + 1; }
function vNum(v, i) { return n(v?.number ?? v?.num ?? v?.verse) ?? i + 1; }
function rowText(row, lane = null) {
  if (!row || typeof row !== 'object') return null;
  if (typeof row.text === 'string') return lane ? null : row.text;
  if (row.text && typeof row.text === 'object' && !Array.isArray(row.text)) {
    if (lane) return typeof row.text[lane] === 'string' ? row.text[lane] : null;
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
      const text = rowText(verse, lane);
      if (typeof text === 'string' && text.trim()) out.push({ ref: `${c}:${v}`, text });
    }
  }
  return out;
}

function compare(active, lane, source) {
  const activeRows = new Map(rows(active, lane).map((row) => [row.ref, row.text]));
  const sourceRows = new Map(rows(source).map((row) => [row.ref, row.text]));
  const missing = [];
  const mismatched = [];
  const extra = [];
  for (const [r, t] of sourceRows.entries()) {
    if (!activeRows.has(r)) missing.push(r);
    else if (activeRows.get(r) !== t) mismatched.push(r);
  }
  for (const r of activeRows.keys()) if (!sourceRows.has(r)) extra.push(r);
  return {
    lane,
    sourceRows: sourceRows.size,
    activeRows: activeRows.size,
    exactRows: sourceRows.size - missing.length - mismatched.length,
    missingCount: missing.length,
    mismatchCount: mismatched.length,
    extraActiveCount: extra.length,
    missingRefs: missing.slice(0, 50),
    mismatchRefs: mismatched.slice(0, 50),
    extraActiveRefs: extra.slice(0, 50),
    status: missing.length || mismatched.length || extra.length ? 'failed' : 'exact_source_collated'
  };
}

const active = read(activePath);
const drb = read(drbPath);
const kjv = hist(kjvPath);
const nabre = hist(nabrePath);
const results = [];
if (active && drb && kjv && nabre) {
  results.push(compare(active, 'KJV', kjv));
  results.push(compare(active, 'NABRE', nabre));
  results.push(compare(active, 'DRB', drb));
}
for (const result of results) {
  if (result.status !== 'exact_source_collated') failures.push({ type: 'lane-failed', lane: result.lane, result });
}

const unresolved = {
  NRSV: active ? rows(active, 'NRSV').length : 0,
  rawText: active ? rows(active, 'rawText').length : 0,
  Rotherham: active ? rows(active, 'Rotherham').length : 0
};

const report = {
  audit: 'tobit-bound-source-status',
  status: failures.length ? 'failed' : 'partial_pass_kjv_nabre_drb_exact_nrsv_rawtext_rotherham_unresolved',
  bibleTextMutation: false,
  activePath,
  sources: { KJV: kjvPath, NABRE: nabrePath, DRB: drbPath, historicalRef: ref },
  results,
  unresolved,
  strictLaneMode: true,
  failures,
  nextRequiredWork: [
    'Record KJV/NABRE/DRB Tobit status only if this passes.',
    'Do not claim full Tobit trust while NRSV, rawText, or Rotherham are unresolved.'
  ]
};

if (reportPath) fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Review Tobit lane failures before repair or status recording.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Record Tobit KJV/NABRE/DRB exact-source-collated; NRSV/rawText/Rotherham remain unresolved.');
}
