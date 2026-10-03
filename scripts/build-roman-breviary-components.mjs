// Roman Breviary 1960/1962 -- component builder (engine rebuild, phase 1).
//
// Converts the pinned Divinum Officium data files (mirrored under
// data/roman-breviary-1960-1962/source/divinum-officium/web/www) into JSON component
// bundles under data/roman-breviary-1960-1962/components/. The conversion is STRUCTURAL
// and LOSSLESS: no text is edited, no conditional is evaluated. Every file can be
// rebuilt byte-for-byte from its JSON entry (proved by audit-roman-breviary-components.mjs).
//
// Sectioned files ("[Name] (condition)" headers) become {preamble, sections[]}.
// Flat files (psalm texts, Ordinarium templates, Tabulae tables) keep their text verbatim.
// Interpreting the conditionals, @-includes and calendar tables is later phases' job.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_ROOT = path.join(__dirname, '..', 'data', 'roman-breviary-1960-1962');
export const WWW = path.join(DATA_ROOT, 'source', 'divinum-officium', 'web', 'www');
export const OUT = path.join(DATA_ROOT, 'components');
export const SCHEMA_VERSION = 'roman_breviary_components_v1';

const HEADER_RE = /^\[([^\]]*)\](.*)$/;

export function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

// Which bundle a mirrored file belongs to: { lang, group, key } or null if not a component source.
export function classify(rel) {
  const parts = rel.split('/');
  if (parts[0] === 'Tabulae') return { lang: 'shared', group: 'tabulae', key: parts.slice(1).join('/') };
  if (parts[0] !== 'horas') return null;
  if (parts[1] === 'Ordinarium') return { lang: 'shared', group: 'ordinarium', key: parts.slice(2).join('/') };
  if (parts[1] === 'horas.setup' || parts[1] === 'horas.dialog') return { lang: 'shared', group: 'setup', key: parts[1] };
  const lang = parts[1] === 'Latin' ? 'la' : parts[1] === 'English' ? 'en' : null;
  if (!lang) return null;
  let group = parts[2].toLowerCase();
  if (parts[2] === 'Psalterium' && parts[3] === 'Psalmorum') group = 'psalmorum';
  return { lang, group, key: parts.slice(2).join('/') };
}

// Lossless structural parse. Lines keep their text exactly; each stored body line ends with "\n".
export function parseText(text) {
  const endsWithNewline = text.endsWith('\n');
  const body = endsWithNewline ? text.slice(0, -1) : text;
  const lines = text === '' ? [] : body.split('\n');
  const sections = [];
  let preamble = '';
  let cur = null;
  for (const line of lines) {
    const m = HEADER_RE.exec(line);
    if (m) {
      cur = { header: line, name: m[1], condition: m[2].trim() || null, body: '' };
      sections.push(cur);
    } else if (cur) {
      cur.body += line + '\n';
    } else {
      preamble += line + '\n';
    }
  }
  return { endsWithNewline, preamble, sections, isSectioned: sections.length > 0 };
}

export function rebuildText(entry) {
  let s;
  if (entry.kind === 'sectioned') {
    s = entry.preamble;
    for (const sec of entry.sections) s += sec.header + '\n' + sec.body;
  } else {
    s = entry.text;
    return s; // flat text is stored whole, including any final newline
  }
  return entry.ends_with_newline ? s : s.slice(0, -1);
}

export function buildEntry(rel, buf) {
  const text = buf.toString('utf8');
  const parsed = parseText(text);
  const base = { source: `web/www/${rel}`, bytes: buf.length, sha256: sha256(buf) };
  if (parsed.isSectioned) {
    return {
      ...base,
      kind: 'sectioned',
      ends_with_newline: parsed.endsWithNewline,
      preamble: parsed.preamble,
      sections: parsed.sections
    };
  }
  return { ...base, kind: 'flat', text };
}

function main() {
  const pin = JSON.parse(fs.readFileSync(path.join(DATA_ROOT, 'source', 'divinum-officium', 'source-pin.json'), 'utf8'));
  const bundles = new Map();
  let count = 0;
  for (const abs of walk(WWW)) {
    const rel = path.relative(WWW, abs).split(path.sep).join('/');
    const c = classify(rel);
    if (!c) continue;
    const id = `${c.lang}/${c.group}`;
    if (!bundles.has(id)) bundles.set(id, { lang: c.lang, group: c.group, files: {} });
    bundles.get(id).files[c.key] = buildEntry(rel, fs.readFileSync(abs));
    count++;
  }
  fs.rmSync(OUT, { recursive: true, force: true });
  const index = { schema_version: SCHEMA_VERSION, source_pin: { repo: pin.repo, commit: pin.commit }, bundles: [] };
  for (const [id, b] of [...bundles].sort((a, c) => (a[0] < c[0] ? -1 : 1))) {
    const dir = path.join(OUT, b.lang);
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${b.group}.json`);
    const doc = { schema_version: SCHEMA_VERSION, source_pin: index.source_pin, lang: b.lang, group: b.group, files: b.files };
    fs.writeFileSync(file, JSON.stringify(doc));
    index.bundles.push({
      id,
      path: `${b.lang}/${b.group}.json`,
      files: Object.keys(b.files).length,
      bytes: fs.statSync(file).size
    });
  }
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 1) + '\n');
  console.log(`built ${count} files into ${index.bundles.length} bundles`);
  for (const b of index.bundles) console.log(`  ${b.id.padEnd(24)} ${String(b.files).padStart(5)} files ${(b.bytes / 1048576).toFixed(2)} MB`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
