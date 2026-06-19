#!/usr/bin/env node
import fs from 'node:fs';

const targets = [
  'project_roadmap.json',
  'structure.json',
  'admin/admin.html',
  'documentation/ROMAN_LOTH_COMPOSITION_MAP_SOURCE_NAVIGATION.md',
  'documentation/structure-archive-2026-05-30-roman-loth-oor-composition.json',
  'documentation/structure.hist1.json',
].filter(file => fs.existsSync(file));

const S = (...parts) => parts.join('');

const hardTerms = [
  S('private', ' corpus'),
  S('private', '-corpus'),
  S('private', ' restricted'),
  S('permission', ' pending'),
  S('permission', ' inquiry'),
  S('permission', ' registry'),
  S('permission', ' status'),
  S('permission', ' contact'),
  S('rights', ' posture'),
  S('source', '-rights'),
  S('source ', 'rights'),
  S('public ', 'rendering'),
  S('blocked ', 'from public'),
  S('render', ' policy'),
  S('render', 'Policy'),
  S('blocked', '_until_authorized'),
  S('publication', '/export'),
  S('release', '/export'),
  S('permission ', 'anxiety'),
  S('rights ', 'review'),
  S('source ', 'permission'),
  S('do ', 'not import'),
];

const hits = [];

for (const file of targets) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);

  lines.forEach((line, idx) => {
    for (const term of hardTerms) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(escaped, 'i');
      if (re.test(line)) {
        hits.push({
          file,
          line: idx + 1,
          term,
          text: line.trim().slice(0, 240),
        });
      }
    }
  });
}

console.log('== PrayerAppNew scoped LOTH metastasis audit ==');
console.log(JSON.stringify({
  targetCount: targets.length,
  targets,
  hitCount: hits.length,
  hits: hits.slice(0, 80),
}, null, 2));

if (hits.length) {
  console.log('SUMMARY: FAIL');
  console.log(`FAILED: ${hits.length} scoped LOTH metastasis hard hit(s)`);
  process.exit(1);
}

console.log('SUMMARY: PASS');
console.log(`PASSED: ${targets.length} scoped control file(s) checked`);
