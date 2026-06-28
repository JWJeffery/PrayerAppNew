#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const activePath = 'data/bible/OT/tobit.json';
const drbPath = 'data/bible/translations/drb-original-douay-rheims/raw/tobias.json';
const ref = 'd0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6';
const sourcePaths = {
  KJV: 'data/bible/translations/kjv-1611/source/aruljohn-bible-kjv-1611/Tobit.json',
  NABRE: 'data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Tobit.json'
};
const reportPath = process.env.TOBIT_BOUND_SOURCE_EXACT_COLLATION_REPORT || null;
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
function rowText(row, lane = null) {
  if (!row || typeof row !== 'object') return null;
  if (typeof row.text === 'string') return row.text;
  if (row.text && typeof row.text === 'object' && !Array.isArray(row.text)) {
    if (lane && typeof row.text[lane] === 'string') return row.text[lane];
    for (const key of ['KJV', 'NABRE', 'DRB', 'NRSV', 'rawText', 'Rotherham']) if (typeof row.text[key] === 'string') return row.text[key];
  }
  return null;
}
function rows(book, lane = null, options = {}) {
  const out = [];
  for (const [ci, ch] of (book?.chapters || []).entries()) {
    const c = chNum(ch, ci);
    if (options.minChapter && c < options.minChapter) continue;
    for (const [vi, verse] of (ch?.verses || []).entries()) {
      const v = vNum(verse, vi);
      const text = rowText(verse, lane);
      if (typeof text === 'string' && text.trim()) out.push({ ref: `${c}:${v}`, text });
    }
  }
  return out;
}
function compare(active, lane, source, options = {}) {
  const activeMap = new Map(rows(active, lane).map((row) => [row.ref, row.text]));
  const sourceMap = new Map(rows(source, null, options).map((row) => [row.ref, row.text]));
  const missing = [];
  const mismatched = [];
  const extra = [];
  for (const [r, t] of sourceMap.entries()) {
    if (!activeMap.has(r)) missing.push(r);
    else if (activeMap.get(r) !== t) mismatched.push(r);
  }
  for (const r of activeMap.keys()) if (!sourceMap.has(r)) extra.push(r);
  return {
    lane,
    sourceRows: sourceMap.size,
    activeRows: activeMap.size,
    exactRows: sourceMap.size - missing.length - mismatched.length,
    missingCount: missing.length,
    mismatchCount: mismatched.length,
    extraActiveCount: extra.length,
    missingRefs: missing.slice(0, 80),
    mismatchRefs: mismatched.slice(0, 80),
    extraActiveRefs: extra.slice(0, 80),
    status: missing.length || mismatched.length || extra.length ? 'failed' : 'exact_source_collated'
  };
}

const active = read(activePath);
const drb = read(drbPath);
const kjv = hist(sourcePaths.KJV);
const nabre = hist(sourcePaths.NABRE);
const results = [];
if (active && drb && kjv && nabre) {
  results.push(compare(active, 'KJV', kjv));
  results.push(compare(active, 'NABRE', nabre));
  results.push(compare(active, 'DRB', drb, { minChapter: 1 }));
}
for (const result of results) if (result.status !== 'exact_source_collated') failures.push({ type: 'lane-failed', lane: result.lane, result });
const unresolved = {
  NRSV: active ? rows(active, 'NRSV').length : 0,
  rawText: active ? rows(active, 'rawText').length : 0,
  Rotherham: active ? rows(active, 'Rotherham').length : 0,
  DRBSourceChapter0: drb ? rows(drb).filter((row) => row.ref.startsWith('0:')).length : 0
};
const report = {
  audit: 'tobit-bound-source-exact-collation',
  status: failures.length ? 'failed' : 'partial_pass_kjv_nabre_drb_exact_nrsv_rawtext_rotherham_unresolved',
  bibleTextMutation: false,
  activePath,
  policy: 'data/bible/registry/tobit-source-address-policy.json',
  results,
  unresolved,
  failures,
  nextRequiredWork: [
    'Record Tobit KJV/NABRE/DRB exact-source-collated only if this passes.',
    'Do not claim full Tobit trust while NRSV/rawText/Rotherham remain unresolved.'
  ]
};
if (reportPath) fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Tobit policy-aware exact collation failed. Review failures before status recording.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Record Tobit KJV/NABRE/DRB exact-source-collated; NRSV/rawText/Rotherham remain unresolved.');
}
