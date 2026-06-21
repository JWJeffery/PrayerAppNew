#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const canonicalOt = [
  'data/bible/OT/genesis.json',
  'data/bible/OT/exodus.json',
  'data/bible/OT/leviticus.json',
  'data/bible/OT/numbers.json',
  'data/bible/OT/deuteronomy.json',
  'data/bible/OT/joshua.json',
  'data/bible/OT/judges.json',
  'data/bible/OT/ruth.json',
  'data/bible/OT/1samuel.json',
  'data/bible/OT/2samuel.json',
  'data/bible/OT/1kings.json',
  'data/bible/OT/2kings.json',
  'data/bible/OT/1chronicles.json',
  'data/bible/OT/2chronicles.json',
  'data/bible/OT/ezra.json',
  'data/bible/OT/nehemiah.json',
  'data/bible/OT/esther.json',
  'data/bible/OT/job.json',
  'data/bible/OT/proverbs.json',
  'data/bible/OT/ecclesiastes.json',
  'data/bible/OT/songofsolomon.json',
  'data/bible/OT/isaiah.json',
  'data/bible/OT/jeremiah.json',
  'data/bible/OT/lamentations.json',
  'data/bible/OT/ezekiel.json',
  'data/bible/OT/daniel.json',
  'data/bible/OT/hosea.json',
  'data/bible/OT/joel.json',
  'data/bible/OT/amos.json',
  'data/bible/OT/obadiah.json',
  'data/bible/OT/jonah.json',
  'data/bible/OT/micah.json',
  'data/bible/OT/nahum.json',
  'data/bible/OT/habakkuk.json',
  'data/bible/OT/zephaniah.json',
  'data/bible/OT/haggai.json',
  'data/bible/OT/zechariah.json',
  'data/bible/OT/malachi.json',
];

function asInt(value) {
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : null;
}

function chapterNumber(chapter, fallbackIndex = null) {
  if (chapter && typeof chapter === 'object') {
    for (const key of ['num', 'number', 'chapter', 'chapterNum']) {
      if (Object.prototype.hasOwnProperty.call(chapter, key)) {
        const n = asInt(chapter[key]);
        if (n !== null) return n;
      }
    }
  }
  return fallbackIndex === null ? null : fallbackIndex + 1;
}

function verseNumber(verse, fallbackIndex = null) {
  if (verse && typeof verse === 'object') {
    for (const key of ['num', 'number', 'verse', 'verseNum']) {
      if (Object.prototype.hasOwnProperty.call(verse, key)) {
        const n = asInt(verse[key]);
        if (n !== null) return n;
      }
    }
  }
  return fallbackIndex === null ? null : fallbackIndex + 1;
}

const failures = [];
const bookSummaries = [];

for (const rel of canonicalOt) {
  const full = path.join(root, rel);
  const item = {
    file: rel,
    exists: fs.existsSync(full),
    parse_ok: false,
    nabre_rows: 0,
    prefix_hits: [],
    missing_nabre_rows: 0,
  };

  if (!item.exists) {
    failures.push({ type: 'missing-file', file: rel });
    bookSummaries.push(item);
    continue;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(full, 'utf8'));
    item.parse_ok = true;
  } catch (error) {
    failures.push({ type: 'parse-error', file: rel, error: String(error.message || error) });
    bookSummaries.push(item);
    continue;
  }

  const chapters = data && typeof data === 'object' ? data.chapters : null;
  if (Array.isArray(chapters)) {
    chapters.forEach((chapter, ci) => {
      const c = chapterNumber(chapter, ci);
      const verses = chapter && typeof chapter === 'object' ? chapter.verses : null;
      if (!Array.isArray(verses)) return;

      verses.forEach((verse, vi) => {
        const v = verseNumber(verse, vi);
        const text = verse && typeof verse === 'object' ? verse.text : null;
        const value = text && typeof text === 'object' ? text.NABRE : null;

        if (typeof value === 'string' && value.trim()) {
          item.nabre_rows += 1;
          const rx = new RegExp(`^\\s*${String(c).replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}:${String(v).replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}[a-z]?\\s+`);
          if (rx.test(value)) {
            item.prefix_hits.push({
              chapter: c,
              verse: v,
              sample: value.slice(0, 160),
            });
          }
        } else {
          item.missing_nabre_rows += 1;
        }
      });
    });
  }

  if (item.prefix_hits.length) {
    failures.push({
      type: 'nabre-prefix-pollution',
      file: rel,
      count: item.prefix_hits.length,
      sample: item.prefix_hits[0],
    });
  }

  bookSummaries.push(item);
}

const report = {
  audit: 'canonical-ot-nabre-prefix-clean',
  status: failures.length ? 'failed' : 'passed',
  note: 'Passing means mechanical NABRE chapter:verse prefixes are absent from canonical OT active rows. It does not mean OT versification or missing rows are repaired.',
  book_count: canonicalOt.length,
  bookSummaries,
  failures,
};

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Review NABRE prefix cleanup failures. Do not claim OT trust.');
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Canonical OT NABRE prefix cleanup is guarded; missing rows and versification defects remain separate.');
}
