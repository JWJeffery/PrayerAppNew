import fs from 'node:fs';
import path from 'node:path';

// Roman Breviary 1960/1962 -- narrow audit checks only.
// documentation/ROMAN_BREVIARY_1960_1962_ARCHITECTURE.md §15 deliberately bars a broad
// audit campaign for this lane and limits audits to five named checks. This script runs
// exactly those five, nothing more, against the dev vertical slice. It is re-runnable as
// the slice grows past one day/one hour.

const ROOT = process.cwd();
const BASE = path.join(ROOT, 'data', 'roman-breviary-1960-1962');
const PIN_PATH = path.join(BASE, 'source', 'divinum-officium', 'source-pin.json');
const UNITS_PATH = path.join(BASE, 'units', 'dev-vertical-slice.json');
const MANIFEST_PATH = path.join(BASE, 'manifests', '2026.json');
const BIBLE_BINDING_PATH = path.join(BASE, 'bible-bindings', 'dev-vertical-slice.json');

// Core Contract §7 -- the closed block-role taxonomy. A lane may not invent a new
// top-level role on its own; anything that does not fit goes to `other`, not a stretch.
const CLOSED_ROLE_TAXONOMY = new Set([
  'opening', 'psalmody', 'reading', 'canticle', 'hymn', 'creed', 'doxology',
  'prayer', 'intercession', 'antiphon', 'rubric', 'dismissal', 'other'
]);

let failures = 0;
let warnings = 0;

function pass(msg) { console.log('  PASS  ' + msg); }
function fail(msg) { console.log('  FAIL  ' + msg); failures++; }
function warn(msg) { console.log('  WARN  ' + msg); warnings++; }

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function findAllJsonFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findAllJsonFiles(full));
    else if (entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}

function walkAllFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkAllFiles(full));
    else out.push(full);
  }
  return out;
}

// --- Check 1: import integrity -- the mirror matches the pinned commit -------------
async function checkImportIntegrity(pin) {
  console.log('\n[1] Import integrity (mirror matches pinned commit ' + pin.commit + ')');
  for (const rel of pin.mirrored_files) {
    const localPath = path.join(BASE, 'source', 'divinum-officium', rel);
    if (!fs.existsSync(localPath)) {
      fail(`declared mirrored file missing on disk: ${rel}`);
      continue;
    }
    const local = fs.readFileSync(localPath, 'utf8');
    const url = `https://raw.githubusercontent.com/${pin.repo}/${pin.commit}/${rel}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        warn(`could not fetch upstream for comparison (HTTP ${res.status}): ${rel}`);
        continue;
      }
      const upstream = await res.text();
      if (upstream === local) pass(`byte-identical to pinned commit: ${rel}`);
      else fail(`mirror DRIFTED from pinned commit: ${rel}`);
    } catch (e) {
      warn(`network unavailable, could not verify: ${rel} (${e.message})`);
    }
  }

  // mirrored_directories -- bulk mirrors (e.g. the 202-file Psalter). Exhaustively fetching
  // every file on every audit run doesn't scale, so: verify the directory exists, count its
  // files, and byte-spot-check a bounded sample against the pinned commit.
  const SAMPLE_SIZE = 5;
  for (const rel of (pin.mirrored_directories || [])) {
    const localDir = path.join(BASE, 'source', 'divinum-officium', rel);
    if (!fs.existsSync(localDir)) {
      fail(`declared mirrored directory missing on disk: ${rel}`);
      continue;
    }
    const files = walkAllFiles(localDir).sort();
    pass(`directory present with ${files.length} files: ${rel}`);
    const sample = files.slice(0, SAMPLE_SIZE);
    for (const localPath of sample) {
      const fileRel = rel + '/' + path.relative(localDir, localPath).split(path.sep).join('/');
      const local = fs.readFileSync(localPath, 'utf8');
      const url = `https://raw.githubusercontent.com/${pin.repo}/${pin.commit}/${fileRel}`;
      try {
        const res = await fetch(url);
        if (!res.ok) { warn(`could not fetch upstream for comparison (HTTP ${res.status}): ${fileRel}`); continue; }
        const upstream = await res.text();
        if (upstream === local) pass(`(sample) byte-identical to pinned commit: ${fileRel}`);
        else fail(`(sample) mirror DRIFTED from pinned commit: ${fileRel}`);
      } catch (e) {
        warn(`network unavailable, could not verify: ${fileRel} (${e.message})`);
      }
    }
    if (files.length > SAMPLE_SIZE) {
      warn(`only spot-checked ${SAMPLE_SIZE} of ${files.length} files in ${rel} -- not exhaustive`);
    }
  }

  // Cross-check: every discrete file actually mirrored on disk is declared in the pin (either
  // as an exact mirrored_files entry or inside a declared mirrored_directories path), and vice
  // versa -- catches the class of defect fixed 2026-09-27 (C9.txt was mirrored and used, but
  // never added to mirrored_files).
  const mirrorRoot = path.join(BASE, 'source', 'divinum-officium', 'web');
  const onDiskRel = new Set(
    fs.existsSync(mirrorRoot)
      ? walkAllFiles(mirrorRoot).map(p => path.relative(path.join(BASE, 'source', 'divinum-officium'), p).split(path.sep).join('/'))
      : []
  );
  const declaredFiles = new Set(pin.mirrored_files);
  const declaredDirs = pin.mirrored_directories || [];
  const isUnderDeclaredDir = rel => declaredDirs.some(dir => rel === dir || rel.startsWith(dir + '/'));

  let allDeclared = true;
  for (const rel of onDiskRel) {
    if (!declaredFiles.has(rel) && !isUnderDeclaredDir(rel)) {
      fail(`file mirrored on disk but undeclared in source-pin.json: ${rel}`);
      allDeclared = false;
    }
  }
  for (const rel of declaredFiles) {
    if (!onDiskRel.has(rel)) { fail(`source-pin.json declares a mirrored file not on disk: ${rel}`); allDeclared = false; }
  }
  if (allDeclared) pass('every mirrored file on disk is declared (as an exact file or under a declared directory)');
}

// --- Check 2: JSON validity ---------------------------------------------------------
function checkJsonValidity() {
  console.log('\n[2] JSON validity');
  const files = findAllJsonFiles(BASE);
  for (const f of files) {
    try {
      readJson(f);
      pass(path.relative(ROOT, f));
    } catch (e) {
      fail(`${path.relative(ROOT, f)}: ${e.message}`);
    }
  }
}

// --- Check 3: manifest validity -- manifests reference real units, well-formed -----
function checkManifestValidity(units, manifest) {
  console.log('\n[3] Manifest validity (unit_refs resolve, no orphans)');
  const unitKeys = new Set(Object.keys(units.units));
  const referenced = new Set();
  const missing = [];

  function walkBlock(block, locationLabel) {
    for (const ref of (block.unit_refs || [])) {
      referenced.add(ref);
      if (!unitKeys.has(ref)) missing.push(`${locationLabel}: ${ref}`);
    }
    for (const child of (block.blocks || [])) walkBlock(child, locationLabel);
  }

  for (const [date, day] of Object.entries(manifest.days || {})) {
    for (const [hourKey, hour] of Object.entries(day.hours || {})) {
      for (const block of (hour.blocks || [])) walkBlock(block, `${date}/${hourKey}`);
    }
  }

  if (missing.length) missing.forEach(m => fail(`manifest references nonexistent unit -- ${m}`));
  else pass(`all ${referenced.size} manifest unit_refs resolve to real units`);

  const orphans = [...unitKeys].filter(k => !referenced.has(k));
  if (orphans.length) orphans.forEach(u => warn(`unit defined but never referenced by any manifest: ${u}`));
  else pass('no orphan units (every defined unit is referenced)');
}

// --- Check 4: reference resolution -- citation/textRef references resolve ---------
function checkReferenceResolution(bibleBinding) {
  console.log('\n[4] Reference resolution (bible-binding report claims match the filesystem)');
  if (!fs.existsSync(BIBLE_BINDING_PATH)) {
    warn('no bible-bindings report found for this slice; skipping');
    return;
  }
  const checked = new Set();
  function check(rel, claimedExists) {
    if (!rel || checked.has(rel)) return;
    checked.add(rel);
    const actual = fs.existsSync(path.join(ROOT, rel));
    if (actual !== claimedExists) fail(`bible-binding report path/existence mismatch: ${rel} (claimed ${claimedExists}, actual ${actual})`);
    else pass(`${rel} (exists=${actual}, as claimed)`);
  }
  for (const r of bibleBinding.scripture_readings || []) {
    check(r.canonical_shared_corpus?.path, r.canonical_shared_corpus?.exists);
    check(r.vulgate_lane?.path, r.vulgate_lane?.exists);
    check(r.interim_catholic_english_lane?.path, r.interim_catholic_english_lane?.exists);
    const { chapter, verse_start, verse_end } = r.bible_ref || {};
    if (verse_start != null && verse_end != null) {
      const expected = verse_end - verse_start + 1;
      for (const [label, lane] of [['canonical_shared_corpus', r.canonical_shared_corpus], ['vulgate_lane', r.vulgate_lane]]) {
        const claimed = lane?.verses_present;
        if (claimed != null && claimed !== expected) {
          fail(`${r.bible_ref.citation} (${label}): claimed verses_present=${claimed}, but ${verse_start}-${verse_end} implies ${expected}`);
        } else if (claimed != null) {
          pass(`${r.bible_ref.citation} (${label}): verses_present arithmetic matches citation range`);
        }
      }
    }
  }
  for (const p of bibleBinding.psalm_appointments || []) {
    check(p.canonical_corpus?.path, p.canonical_corpus?.exists);
    check(p.vulgate_psalter_lane?.path, p.vulgate_psalter_lane?.exists);
    check(p.interim_catholic_english_lane?.path, p.interim_catholic_english_lane?.exists);
  }
}

// --- Check 5: envelope conformance -- valid resolved-office envelope ---------------
function checkEnvelopeConformance(manifest) {
  console.log('\n[5] Envelope conformance (Core Contract §4/§7 -- closed block-role taxonomy)');
  const nonConformant = [];

  function walkBlock(block, locationLabel) {
    if (!CLOSED_ROLE_TAXONOMY.has(block.role)) {
      nonConformant.push(`${locationLabel}: role "${block.role}" (label "${block.label}") is not in the closed taxonomy`);
    }
    for (const child of (block.blocks || [])) walkBlock(child, locationLabel);
  }

  for (const [date, day] of Object.entries(manifest.days || {})) {
    for (const [hourKey, hour] of Object.entries(day.hours || {})) {
      for (const block of (hour.blocks || [])) walkBlock(block, `${date}/${hourKey}`);
    }
  }

  if (nonConformant.length) {
    nonConformant.forEach(n => fail(n));
    console.log('       See documentation/ROMAN_BREVIARY_1960_1962_AUDIT.md for the disclosed,');
    console.log('       not-yet-fixed finding and the established Horologion-lane fix precedent.');
  } else {
    pass('every block role is a member of the closed taxonomy');
  }
}

async function main() {
  console.log('Roman Breviary 1960/1962 -- narrow audit checks (architecture §15)');
  const pin = readJson(PIN_PATH);
  const units = readJson(UNITS_PATH);
  const manifest = readJson(MANIFEST_PATH);
  const bibleBinding = fs.existsSync(BIBLE_BINDING_PATH) ? readJson(BIBLE_BINDING_PATH) : null;

  await checkImportIntegrity(pin);
  checkJsonValidity();
  checkManifestValidity(units, manifest);
  if (bibleBinding) checkReferenceResolution(bibleBinding);
  checkEnvelopeConformance(manifest);

  console.log(`\n${failures} failing, ${warnings} warning.`);
  if (failures > 0) process.exitCode = 1;
}

main();
