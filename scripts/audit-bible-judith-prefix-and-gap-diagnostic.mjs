#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';

const activePath = 'data/bible/OT/judith.json';
const ref = 'd0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6';
const sourcePaths = {
  KJV: 'data/bible/translations/kjv-1611/source/aruljohn-bible-kjv-1611/Judith.json',
  NABRE: 'data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Judith.json'
};
const reportPath = process.env.JUDITH_PREFIX_GAP_DIAGNOSTIC_REPORT || null;
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
function stripPrefix(refKey, value) {
  return String(value || '').replace(new RegExp(`^${refKey.replace(':', '\\:')}\\s+`), '');
}
function hash(value) { return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 16); }
function diagnoseLane(lane, active, source) {
  const a = rows(active, lane);
  const s = rows(source, null);
  let exactWithoutNormalization = 0;
  let exactAfterPrefixStrip = 0;
  const missingRefs = [];
  const stillMismatchRefs = [];
  const missingWithOtherActiveLanes = [];
  for (const [refKey, sourceText] of s.entries()) {
    const activeText = a.get(refKey);
    if (!activeText) {
      const activeRow = [...['KJV', 'NABRE', 'NRSV', 'DRB']].reduce((acc, other) => {
        const otherMap = rows(active, other);
        const otherText = otherMap.get(refKey);
        if (otherText) acc[other] = { present: true, textHash: hash(otherText), textLength: otherText.length };
        return acc;
      }, {});
      missingRefs.push(refKey);
      missingWithOtherActiveLanes.push({ ref: refKey, otherActiveLanes: activeRow });
    } else if (activeText === sourceText) {
      exactWithoutNormalization += 1;
      exactAfterPrefixStrip += 1;
    } else if (stripPrefix(refKey, activeText) === sourceText) {
      exactAfterPrefixStrip += 1;
    } else {
      stillMismatchRefs.push({ ref: refKey, activeHash: hash(activeText), sourceHash: hash(sourceText), activeLength: activeText.length, sourceLength: sourceText.length });
    }
  }
  return {
    lane,
    sourceRows: s.size,
    activeRows: a.size,
    exactWithoutNormalization,
    exactAfterPrefixStrip,
    missingCount: missingRefs.length,
    stillMismatchCountAfterPrefixStrip: stillMismatchRefs.length,
    missingRefs,
    missingWithOtherActiveLanes,
    stillMismatchRefs: stillMismatchRefs.slice(0, 80),
    prefixStripWouldCloseExistingActiveRows: exactAfterPrefixStrip === a.size && stillMismatchRefs.length === 0
  };
}
const active = read(activePath);
const kjv = hist(sourcePaths.KJV);
const nabre = hist(sourcePaths.NABRE);
const diagnostics = [];
if (active && kjv && nabre) {
  diagnostics.push(diagnoseLane('KJV', active, kjv));
  diagnostics.push(diagnoseLane('NABRE', active, nabre));
}
const report = {
  audit: 'judith-prefix-and-gap-diagnostic',
  status: failures.length ? 'failed' : 'classified',
  bibleTextMutation: false,
  activePath,
  historicalRef: ref,
  diagnostics,
  failures,
  nextRequiredWork: [
    'If prefix stripping closes all existing active KJV/NABRE rows, apply bounded prefix cleanup only.',
    'Do not synthesize the twenty missing KJV/NABRE refs unless a source-address insertion policy is selected.',
    'Keep Judith full trust blocked while NRSV remains unresolved.'
  ]
};
if (reportPath) fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Judith prefix/gap diagnostic failed. Review input failures.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Use diagnostic to select Judith KJV/NABRE prefix cleanup and missing-ref policy.');
}
