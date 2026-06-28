#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const activePath = 'data/bible/OT/judith.json';
const drbPath = 'data/bible/translations/drb-original-douay-rheims/raw/judith.json';
const ref = 'd0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6';
const sourcePaths = {
  KJV: 'data/bible/translations/kjv-1611/source/aruljohn-bible-kjv-1611/Judith.json',
  NABRE: 'data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Judith.json'
};
const reportPath = process.env.JUDITH_BOUND_SOURCE_STATUS_REPORT || null;
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
function asInt(value) { const out = Number.parseInt(String(value), 10); return Number.isFinite(out) ? out : null; }
function chapter(ch, i) { return asInt(ch?.number ?? ch?.num ?? ch?.chapter) ?? i + 1; }
function verse(vs, i) { return asInt(vs?.number ?? vs?.num ?? vs?.verse) ?? i + 1; }
function text(row, lane) {
  if (!row || typeof row !== 'object') return null;
  if (lane) return row.text && typeof row.text === 'object' && !Array.isArray(row.text) && typeof row.text[lane] === 'string' ? row.text[lane] : null;
  if (typeof row.text === 'string') return row.text;
  if (row.text && typeof row.text === 'object' && !Array.isArray(row.text)) {
    for (const key of ['KJV', 'NABRE', 'DRB', 'NRSV', 'rawText', 'Rotherham']) if (typeof row.text[key] === 'string') return row.text[key];
  }
  return null;
}
function rows(book, lane) {
  const out = new Map();
  for (const [ci, ch] of (book?.chapters || []).entries()) {
    const c = chapter(ch, ci);
    for (const [vi, vs] of (ch?.verses || []).entries()) {
      const v = verse(vs, vi);
      const t = text(vs, lane);
      if (typeof t === 'string' && t.trim()) out.set(`${c}:${v}`, t);
    }
  }
  return out;
}
function compare(label, active, source) {
  const a = rows(active, label);
  const s = rows(source, null);
  const missing = [];
  const mismatched = [];
  const extra = [];
  for (const [r, t] of s.entries()) {
    if (!a.has(r)) missing.push(r);
    else if (a.get(r) !== t) mismatched.push(r);
  }
  for (const r of a.keys()) if (!s.has(r)) extra.push(r);
  return {
    lane: label,
    sourceRows: s.size,
    activeRows: a.size,
    exactRows: s.size - missing.length - mismatched.length,
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
  results.push(compare('KJV', active, kjv));
  results.push(compare('NABRE', active, nabre));
  results.push(compare('DRB', active, drb));
}
for (const r of results) if (r.status !== 'exact_source_collated') failures.push({ type: 'lane-failed', lane: r.lane, result: r });
const report = {
  audit: 'judith-bound-source-status',
  status: failures.length ? 'failed' : 'partial_pass_kjv_nabre_drb_exact_nrsv_unresolved',
  bibleTextMutation: false,
  strictLaneMode: true,
  activePath,
  sources: { KJV: sourcePaths.KJV, NABRE: sourcePaths.NABRE, DRB: drbPath, historicalRef: ref },
  results,
  unresolved: {
    NRSV: active ? rows(active, 'NRSV').size : 0,
    Rotherham: active ? rows(active, 'Rotherham').size : 0,
    rawText: active ? rows(active, 'rawText').size : 0
  },
  failures,
  nextRequiredWork: [
    'Record Judith KJV/NABRE/DRB exact-source-collated only if this passes.',
    'Do not claim full Judith trust while NRSV remains unresolved.'
  ]
};
if (reportPath) fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Judith strict source audit failed. Review failures before repair or status recording.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Record Judith KJV/NABRE/DRB exact-source-collated; NRSV remains unresolved.');
}
