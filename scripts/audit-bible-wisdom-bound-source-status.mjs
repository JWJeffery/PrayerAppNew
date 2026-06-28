#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const activePath = 'data/bible/OT/wisdom.json';
const drbPath = 'data/bible/translations/drb-original-douay-rheims/raw/wisdom.json';
const histRef = 'd0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6';
const sourcePaths = {
  KJV: 'data/bible/translations/kjv-1611/source/aruljohn-bible-kjv-1611/Wisdom of Solomon.json',
  NABRE: 'data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Wisdom.json'
};
const reportPath = process.env.WISDOM_BOUND_SOURCE_STATUS_REPORT || null;
const failures = [];
function read(path) {
  try { return JSON.parse(fs.readFileSync(path, 'utf8')); }
  catch (error) { failures.push({ type: 'read-failed', path, error: String(error.message || error) }); return null; }
}
function historical(path) {
  const got = spawnSync('git', ['show', `${histRef}:${path}`], { encoding: 'utf8' });
  if (got.status !== 0) { failures.push({ type: 'git-show-failed', path, stderr: String(got.stderr || '').trim() }); return null; }
  try { return JSON.parse(got.stdout); }
  catch (error) { failures.push({ type: 'parse-failed', path, error: String(error.message || error) }); return null; }
}
function asInt(value) { const out = Number.parseInt(String(value), 10); return Number.isFinite(out) ? out : null; }
function chapterNo(ch, index) { return asInt(ch?.number ?? ch?.num ?? ch?.chapter) ?? index + 1; }
function verseNo(row, index) { return asInt(row?.number ?? row?.num ?? row?.verse) ?? index + 1; }
function textOf(row, lane = null) {
  if (!row || typeof row !== 'object') return null;
  if (lane) return row.text && typeof row.text === 'object' && !Array.isArray(row.text) && typeof row.text[lane] === 'string' ? row.text[lane] : null;
  if (typeof row.text === 'string') return row.text;
  if (row.text && typeof row.text === 'object' && !Array.isArray(row.text)) {
    for (const key of ['KJV', 'NABRE', 'DRB', 'NRSV', 'rawText', 'Rotherham']) if (typeof row.text[key] === 'string') return row.text[key];
  }
  return null;
}
function rows(book, lane = null) {
  const out = new Map();
  for (const [ci, ch] of (book?.chapters || []).entries()) {
    const c = chapterNo(ch, ci);
    for (const [vi, row] of (ch?.verses || []).entries()) {
      const v = verseNo(row, vi);
      const text = textOf(row, lane);
      if (typeof text === 'string' && text.trim()) out.set(`${c}:${v}`, text);
    }
  }
  return out;
}
function compare(lane, active, source) {
  const activeMap = rows(active, lane);
  const sourceMap = rows(source, null);
  const missing = [];
  const mismatched = [];
  const extra = [];
  for (const [ref, text] of sourceMap.entries()) {
    if (!activeMap.has(ref)) missing.push(ref);
    else if (activeMap.get(ref) !== text) mismatched.push(ref);
  }
  for (const ref of activeMap.keys()) if (!sourceMap.has(ref)) extra.push(ref);
  return {
    lane,
    sourceRows: sourceMap.size,
    activeRows: activeMap.size,
    exactRows: sourceMap.size - missing.length - mismatched.length,
    missingCount: missing.length,
    mismatchCount: mismatched.length,
    extraActiveCount: extra.length,
    missingRefs: missing.slice(0, 120),
    mismatchRefs: mismatched.slice(0, 120),
    extraActiveRefs: extra.slice(0, 120),
    status: missing.length || mismatched.length || extra.length ? 'failed' : 'exact_source_collated'
  };
}
const active = read(activePath);
const drb = read(drbPath);
const kjv = historical(sourcePaths.KJV);
const nabre = historical(sourcePaths.NABRE);
const results = [];
if (active && drb && kjv && nabre) {
  results.push(compare('KJV', active, kjv));
  results.push(compare('NABRE', active, nabre));
  results.push(compare('DRB', active, drb));
}
for (const result of results) if (result.status !== 'exact_source_collated') failures.push({ type: 'lane-failed', lane: result.lane, result });
const report = {
  audit: 'wisdom-bound-source-status',
  status: failures.length ? 'failed' : 'partial_pass_kjv_nabre_drb_exact_nrsv_unresolved',
  bibleTextMutation: false,
  strictLaneMode: true,
  activePath,
  sources: { KJV: sourcePaths.KJV, NABRE: sourcePaths.NABRE, DRB: drbPath, historicalRef: histRef },
  results,
  unresolved: {
    NRSV: active ? rows(active, 'NRSV').size : 0,
    Rotherham: active ? rows(active, 'Rotherham').size : 0,
    rawText: active ? rows(active, 'rawText').size : 0
  },
  failures,
  nextRequiredWork: [
    'Record Wisdom KJV/NABRE/DRB exact-source-collated only if this passes.',
    'If this fails, classify whether failures are source-prefix, source-address, or real mismatch before repair.',
    'Do not claim full Wisdom trust while NRSV remains unresolved.'
  ]
};
if (reportPath) fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Wisdom strict source audit failed. Review failures before repair or status recording.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Record Wisdom KJV/NABRE/DRB exact-source-collated; NRSV remains unresolved.');
}
