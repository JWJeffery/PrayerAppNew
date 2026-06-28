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
const reportPath = process.env.TOBIT_BOUND_SOURCE_LANE_REPAIR_REPORT || null;
const failures = [];
const removals = [];

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
function refs(book, options = {}) {
  const out = new Set();
  for (const [ci, ch] of (book?.chapters || []).entries()) {
    const c = chNum(ch, ci);
    if (options.minChapter && c < options.minChapter) continue;
    for (const [vi, verse] of (ch?.verses || []).entries()) {
      const v = vNum(verse, vi);
      if (rowText(verse)) out.add(`${c}:${v}`);
    }
  }
  return out;
}
function cleanup(active, lane, sourceRefs) {
  for (const [ci, ch] of (active?.chapters || []).entries()) {
    const c = chNum(ch, ci);
    for (const [vi, verse] of (ch?.verses || []).entries()) {
      const v = vNum(verse, vi);
      const refKey = `${c}:${v}`;
      if (verse.text && typeof verse.text === 'object' && !Array.isArray(verse.text) && typeof verse.text[lane] === 'string' && !sourceRefs.has(refKey)) {
        delete verse.text[lane];
        removals.push({ lane, ref: refKey });
      }
    }
  }
}

const active = read(activePath);
const drb = read(drbPath);
const kjv = hist(sourcePaths.KJV);
const nabre = hist(sourcePaths.NABRE);
if (active && drb && kjv && nabre) {
  cleanup(active, 'KJV', refs(kjv));
  cleanup(active, 'NABRE', refs(nabre));
  cleanup(active, 'DRB', refs(drb, { minChapter: 1 }));
}
if (!failures.length && active) fs.writeFileSync(activePath, `${JSON.stringify(active, null, 2)}\n`);
const report = {
  repair: 'tobit-bound-source-lanes',
  status: failures.length ? 'failed' : 'repaired',
  activePath,
  bibleTextMutation: true,
  mutationScope: 'Remove KJV/NABRE/DRB active Tobit lane text where the bound source has no displayed address. Does not touch NRSV/rawText/Rotherham.',
  removalCount: removals.length,
  removalSummary: removals.reduce((acc, row) => { acc[row.lane] = (acc[row.lane] || 0) + 1; return acc; }, {}),
  removals,
  failures
};
if (reportPath) fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Tobit lane cleanup failed. Review failures; active file was not written if failures occurred.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Run Tobit policy-aware exact source collation audit.');
}
