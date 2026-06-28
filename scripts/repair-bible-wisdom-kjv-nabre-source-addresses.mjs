#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const activePath = 'data/bible/OT/wisdom.json';
const histRef = 'd0eed049f47e5eda8abcc4f4b1bb0d77efc51bd6';
const sourcePaths = {
  KJV: 'data/bible/translations/kjv-1611/source/aruljohn-bible-kjv-1611/Wisdom of Solomon.json',
  NABRE: 'data/bible/translations/nabre-internal-source-lane/source/generated_data/books/Wisdom.json'
};
const reportPath = process.env.WISDOM_KJV_NABRE_SOURCE_ADDRESS_REPAIR_REPORT || null;
const failures = [];
const stripped = [];
const inserted = [];
const createdRows = new Set();
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
function num(value) { const n = Number.parseInt(String(value), 10); return Number.isFinite(n) ? n : null; }
function chNo(ch, i) { return num(ch?.number ?? ch?.num ?? ch?.chapter) ?? i + 1; }
function vNo(row, i) { return num(row?.number ?? row?.num ?? row?.verse) ?? i + 1; }
function sourceText(row) { return typeof row?.text === 'string' ? row.text : null; }
function sourceMap(book) {
  const out = new Map();
  for (const [ci, ch] of (book?.chapters || []).entries()) {
    const c = chNo(ch, ci);
    for (const [vi, row] of (ch?.verses || []).entries()) {
      const v = vNo(row, vi);
      const t = sourceText(row);
      if (typeof t === 'string' && t.trim()) out.set(`${c}:${v}`, { c, v, t });
    }
  }
  return out;
}
function findChapter(active, c) {
  let ch = active.chapters.find((x, i) => chNo(x, i) === c);
  if (!ch) {
    ch = { number: c, verses: [] };
    active.chapters.push(ch);
    active.chapters.sort((a, b) => chNo(a, 0) - chNo(b, 0));
  }
  return ch;
}
function findVerse(active, c, v) {
  const ch = findChapter(active, c);
  let row = ch.verses.find((x, i) => vNo(x, i) === v);
  if (!row) {
    row = { number: v, text: {} };
    ch.verses.push(row);
    ch.verses.sort((a, b) => vNo(a, 0) - vNo(b, 0));
    createdRows.add(`${c}:${v}`);
  }
  if (!row.text || typeof row.text !== 'object' || Array.isArray(row.text)) row.text = {};
  return row;
}
function activeRows(active, lane) {
  const out = new Map();
  for (const [ci, ch] of (active?.chapters || []).entries()) {
    const c = chNo(ch, ci);
    for (const [vi, row] of (ch?.verses || []).entries()) {
      const v = vNo(row, vi);
      if (row.text && typeof row.text === 'object' && typeof row.text[lane] === 'string' && row.text[lane].trim()) out.set(`${c}:${v}`, row);
    }
  }
  return out;
}
function repairLane(active, lane, source) {
  const src = sourceMap(source);
  const act = activeRows(active, lane);
  for (const [ref, row] of act.entries()) {
    const wanted = src.get(ref)?.t;
    if (!wanted) continue;
    const prefix = `${ref} `;
    const current = row.text[lane];
    if (current !== wanted && current.startsWith(prefix) && current.slice(prefix.length) === wanted) {
      row.text[lane] = wanted;
      stripped.push({ lane, ref });
    }
  }
  for (const [ref, wanted] of src.entries()) {
    const row = findVerse(active, wanted.c, wanted.v);
    if (!(typeof row.text[lane] === 'string' && row.text[lane].trim())) {
      row.text[lane] = wanted.t;
      inserted.push({ lane, ref });
    }
  }
}
const active = read(activePath);
const kjv = historical(sourcePaths.KJV);
const nabre = historical(sourcePaths.NABRE);
if (active && kjv && nabre) {
  repairLane(active, 'KJV', kjv);
  repairLane(active, 'NABRE', nabre);
}
if (!failures.length && active) fs.writeFileSync(activePath, `${JSON.stringify(active, null, 2)}\n`);
const report = { repair: 'wisdom-kjv-nabre-source-addresses', status: failures.length ? 'failed' : 'repaired', bibleTextMutation: true, activePath, policy: 'data/bible/registry/wisdom-source-address-policy.json', strippedPrefixCount: stripped.length, insertedLaneCellCount: inserted.length, createdRowCount: createdRows.size, stripped, inserted, createdRows: [...createdRows], failures };
if (reportPath) fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failures.length) { console.log('ALL FAILED'); console.log('NEXT: Wisdom KJV/NABRE repair failed. Review failures before audit.'); process.exitCode = 1; }
else { console.log('ALL PASSED'); console.log('NEXT: Run Wisdom strict source collation audit.'); }
