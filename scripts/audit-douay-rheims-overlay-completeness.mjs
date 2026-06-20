#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dirs = ['data/bible/OT', 'data/bible/NT'];
const failures = [];
let checkedBooks = 0;

for (const dir of dirs) {
  for (const name of fs.readdirSync(dir).filter(n => n.endsWith('.json')).sort()) {
    const file = path.join(dir, name);
    const book = JSON.parse(fs.readFileSync(file, 'utf8'));

    if (Array.isArray(book)) {
      if (name === 'psalms.json') {
        const missing = book
          .filter(r => /^PSALM\s+([1-9]\d?|1[0-4]\d|150)$/i.test(String(r.id || '')))
          .filter(r => !(typeof r.text?.DRB === 'string' && r.text.DRB.trim()))
          .map(r => r.id);
        if (missing.length) failures.push(`${file}: missing DRB ${missing.slice(0, 20).join(', ')}`);
        checkedBooks++;
      }
      continue;
    }

    if (!Array.isArray(book.chapters)) continue;
    checkedBooks++;

    if (!book.meta?.translations?.DRB) failures.push(`${file}: missing meta.translations.DRB`);

    for (const ch of book.chapters) {
      for (const verse of ch.verses || []) {
        if (!(typeof verse.text?.DRB === 'string' && verse.text.DRB.trim())) {
          failures.push(`${file}: missing DRB at ${ch.num}:${verse.num}`);
        }
      }
    }
  }
}

if (failures.length) {
  console.error(JSON.stringify({ result: 'FAIL', checkedBooks, failureCount: failures.length, failures: failures.slice(0, 40) }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ result: 'OK', checkedBooks }, null, 2));
