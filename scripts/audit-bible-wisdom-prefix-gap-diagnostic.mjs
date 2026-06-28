#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const activePath = 'data/bible/OT/wisdom.json';
const histRef = 'd0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6';
const sourcePaths = {
  KJV: 'data/bible/translations/kjv-1611/source/aruljohn-bible-kjv-1611/Wisdom of Solomon.json',
  NABRE: 'data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Wisdom.json'
};
const reportPath = process.env.WISDOM_PREFIX_GAP_DIAGNOSTIC_REPORT || null;
const failures = [];
function read(path) {
  try { return JSON.parse(fs.readFileSync(path, 'utf8')); }
  catch (error) { failures.push({ type: 'read-failed', path, error: String(error.message || error) }); return null; }
}
function hist(path) {
  const got = spawnSync('git', ['show', `${histRef}:${path}`], { encoding: 'utf8' });
  if (got.status !== 0) { failures.push({ type: 'git-show-failed', path }); return null; }
  try { return JSON.parse(got.stdout); }
  catch (error) { failures.push({ type: 'parse-failed', path, error: String(error.message || error) }); return null; }
}
function num(value) { const n = Number.parseInt(String(value), 10); return Number.isFinite(n) ? n : null; }
function cno(ch, i) { return num(ch?.number ?? ch?.num ?? ch?.chapter) ?? i + 1; }
function vno(row, i) { return num(row?.number ?? row?.num ?? row?.verse) ?? i + 1; }
function text(row, lane) {
  if (!row || typeof row !== 'object') return null;
  if (lane) return row.text && typeof row.text === 'object' && !Array.isArray(row.text) && typeof row.text[lane] === 'string' ? row.text[lane] : null;
  return typeof row.text === 'string' ? row.text : null;
}
function rows(book, lane) {
  const out = new Map();
  for (const [ci, ch] of (book?.chapters || []).entries()) {
    const c = cno(ch, ci);
    for (const [vi, row] of (ch?.verses || []).entries()) {
      const v = vno(row, vi);
      const t = text(row, lane);
      if (typeof t === 'string' && t.trim()) out.set(`${c}:${v}`, t);
    }
  }
  return out;
}
function sourceRows(book) {
  const out = new Map();
  for (const [ci, ch] of (book?.chapters || []).entries()) {
    const c = cno(ch, ci);
    for (const [vi, row] of (ch?.verses || []).entries()) {
      const v = vno(row, vi);
      const t = text(row, null);
      if (typeof t === 'string' && t.trim()) out.set(`${c}:${v}`, t);
    }
  }
  return out;
}
function strip(ref, value) {
  const prefix = `${ref} `;
  return String(value || '').startsWith(prefix) ? String(value).slice(prefix.length) : String(value || '');
}
function diagnose(lane, active, source) {
  const a = rows(active, lane);
  const s = sourceRows(source);
  const laneMaps = Object.fromEntries(['KJV', 'NABRE', 'NRSV', 'DRB', 'rawText', 'Rotherham'].map(x => [x, rows(active, x)]));
  let exactWithoutNormalization = 0;
  let exactAfterPrefixStrip = 0;
  const missingRefs = [];
  const stillMismatchRefs = [];
  const missingWithOtherActiveLanes = [];
  for (const [ref, wanted] of s.entries()) {
    const got = a.get(ref);
    if (!got) {
      const otherActiveLanes = Object.fromEntries(Object.entries(laneMaps).filter(([, map]) => map.has(ref)).map(([k, map]) => [k, { present: true, textLength: map.get(ref).length }]));
      missingRefs.push(ref);
      missingWithOtherActiveLanes.push({ ref, otherActiveLanes });
    } else if (got === wanted) {
      exactWithoutNormalization += 1;
      exactAfterPrefixStrip += 1;
    } else if (strip(ref, got) === wanted) {
      exactAfterPrefixStrip += 1;
    } else {
      stillMismatchRefs.push(ref);
    }
  }
  return { lane, sourceRows: s.size, activeRows: a.size, exactWithoutNormalization, exactAfterPrefixStrip, missingCount: missingRefs.length, stillMismatchCountAfterPrefixStrip: stillMismatchRefs.length, missingRefs, missingWithOtherActiveLanes, stillMismatchRefs: stillMismatchRefs.slice(0, 120), prefixStripWouldCloseExistingActiveRows: exactAfterPrefixStrip === a.size && stillMismatchRefs.length === 0 };
}
const active = read(activePath);
const kjv = hist(sourcePaths.KJV);
const nabre = hist(sourcePaths.NABRE);
const diagnostics = [];
if (active && kjv && nabre) {
  diagnostics.push(diagnose('KJV', active, kjv));
  diagnostics.push(diagnose('NABRE', active, nabre));
}
const report = { audit: 'wisdom-prefix-gap-diagnostic', status: failures.length ? 'failed' : 'classified', bibleTextMutation: false, activePath, historicalRef: histRef, diagnostics, failures };
if (reportPath) fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failures.length) { console.log('ALL FAILED'); console.log('NEXT: Wisdom prefix/gap diagnostic failed. Review input failures.'); process.exitCode = 1; }
else { console.log('ALL PASSED'); console.log('NEXT: Use diagnostic to select Wisdom KJV/NABRE prefix cleanup and missing-ref policy.'); }
