import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const UNITS_PATH = path.join(ROOT, 'data/roman-breviary-1960-1962/units/dev-vertical-slice.json');
const MANIFEST_PATH = path.join(ROOT, 'data/roman-breviary-1960-1962/manifests/2026.json');
const OUT_PATH = path.join(ROOT, 'data/roman-breviary-1960-1962/bible-bindings/dev-vertical-slice.json');

const REQUIRED_LATIN_LANE = 'VULGATE_CLEMENTINE';
const REQUIRED_LATIN_PSALTER_LANE = 'VULGATE_PSALTER';
const INTERIM_CATHOLIC_ENGLISH_LANE = 'DRB_ORIGINAL';

const BOOKS = {
  Job: {
    book_id: 'JOB',
    display: 'Job',
    canonical_path: 'data/bible/OT/job.json',
    drb_path: 'data/bible/translations/drb-original-douay-rheims/raw/job.json'
  },
  '1 Cor': {
    book_id: '1_CORINTHIANS',
    display: '1 Corinthians',
    canonical_path: 'data/bible/NT/1corinthians.json',
    drb_path: 'data/bible/translations/drb-original-douay-rheims/raw/1-corinthians.json'
  },
  Psalms: {
    book_id: 'PSALMS',
    display: 'Psalms',
    canonical_path: 'data/bible/OT/psalms.json',
    drb_path: 'data/bible/translations/drb-original-douay-rheims/raw/psalms.json'
  }
};

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function parseScriptureCitation(citation) {
  const m = String(citation || '').trim().match(/^(Job|1 Cor)\s+(\d+):(\d+)-(\d+)$/);
  if (!m) return null;
  return {
    book_label: m[1],
    chapter: Number(m[2]),
    verse_start: Number(m[3]),
    verse_end: Number(m[4])
  };
}

function canonicalChapter(data, chapter) {
  return (data.chapters || []).find(item => Number(item.num ?? item.chapter) === Number(chapter));
}

function drbChapter(data, chapter) {
  return (data.chapters || []).find(item => Number(item.chapter ?? item.num) === Number(chapter));
}

function canonicalVerse(data, chapter, verse) {
  const c = canonicalChapter(data, chapter);
  if (!c) return null;
  return (c.verses || []).find(item => Number(item.num ?? item.verse) === Number(verse)) || null;
}

function drbVerse(data, chapter, verse) {
  const c = drbChapter(data, chapter);
  if (!c) return null;
  return (c.verses || []).find(item => Number(item.verse ?? item.num) === Number(verse)) || null;
}

function translationKeysForCanonical(relPath) {
  if (!exists(relPath)) return [];
  const data = readJson(relPath);
  const keys = new Set(Object.keys(data.meta?.translations || {}));
  for (const chapter of data.chapters || []) {
    for (const verse of chapter.verses || []) {
      for (const key of Object.keys(verse.text || {})) {
        keys.add(key);
      }
    }
  }
  return [...keys].sort();
}

function coverageForCanonical(relPath, ref) {
  if (!exists(relPath)) return { exists: false, verses_present: 0, verse_count: ref.verse_end - ref.verse_start + 1 };
  const data = readJson(relPath);
  let versesPresent = 0;
  for (let verse = ref.verse_start; verse <= ref.verse_end; verse += 1) {
    if (canonicalVerse(data, ref.chapter, verse)) versesPresent += 1;
  }
  return {
    exists: true,
    verses_present: versesPresent,
    verse_count: ref.verse_end - ref.verse_start + 1,
    translation_keys: translationKeysForCanonical(relPath)
  };
}

function coverageForDrb(relPath, ref) {
  if (!exists(relPath)) return { exists: false, verses_present: 0, verse_count: ref.verse_end - ref.verse_start + 1 };
  const data = readJson(relPath);
  let versesPresent = 0;
  for (let verse = ref.verse_start; verse <= ref.verse_end; verse += 1) {
    if (drbVerse(data, ref.chapter, verse)) versesPresent += 1;
  }
  return {
    exists: true,
    verses_present: versesPresent,
    verse_count: ref.verse_end - ref.verse_start + 1,
    translation_key: 'DRB'
  };
}

function walkManifestBlocks(blocks, out = []) {
  for (const block of blocks || []) {
    out.push(block);
    walkManifestBlocks(block.blocks || [], out);
  }
  return out;
}

function extractPsalmAppointments(units) {
  const rows = [];
  for (const unit of Object.values(units.units || {})) {
    if (unit.kind !== 'psalmody_appointment') continue;
    const nocturnMatch = String(unit.key || '').match(/nocturnus(\d+)/);
    const nocturn = nocturnMatch ? Number(nocturnMatch[1]) : null;
    const lines = String(unit.text || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);

    for (let index = 0; index < lines.length; index += 1) {
      const antLine = lines[index];
      const psalmLine = lines[index + 1] || '';
      const psalmMatch = psalmLine.match(/^Ps\.\s*(\d+)$/);
      if (!antLine.startsWith('Ant. ') || !psalmMatch) continue;
      rows.push({
        unit_key: unit.key,
        nocturn,
        antiphon: antLine.replace(/^Ant\.\s*/, ''),
        bible_ref: {
          book_id: 'PSALMS',
          chapter: Number(psalmMatch[1]),
          verse_start: null,
          verse_end: null,
          numbering_status: 'roman_breviary_source_appointment_numbering_not_yet_normalized'
        },
        required_latin_psalter_lane: REQUIRED_LATIN_PSALTER_LANE,
        body_status: 'appointment_only_no_psalm_body_materialization',
        canonical_corpus: {
          path: BOOKS.Psalms.canonical_path,
          exists: exists(BOOKS.Psalms.canonical_path),
          translation_keys: translationKeysForCanonical(BOOKS.Psalms.canonical_path)
        },
        interim_catholic_english_lane: {
          lane_id: INTERIM_CATHOLIC_ENGLISH_LANE,
          path: BOOKS.Psalms.drb_path,
          exists: exists(BOOKS.Psalms.drb_path)
        }
      });
      index += 1;
    }
  }
  return rows;
}

function buildScriptureBindings(units, manifest) {
  const manifestBlocks = walkManifestBlocks(
    manifest.days?.['2026-11-02']?.hours?.matins?.blocks || []
  );

  const labelByUnitRef = new Map();
  for (const block of manifestBlocks) {
    for (const unitRef of block.unit_refs || []) {
      labelByUnitRef.set(unitRef, block.label || block.role || '');
    }
  }

  const bindings = [];

  for (const unit of Object.values(units.units || {})) {
    if (unit.kind !== 'reading') continue;
    const parsed = parseScriptureCitation(unit.citation);
    if (!parsed) continue;

    const book = BOOKS[parsed.book_label];
    const ref = {
      book_id: book.book_id,
      book_label: book.display,
      chapter: parsed.chapter,
      verse_start: parsed.verse_start,
      verse_end: parsed.verse_end,
      citation: unit.citation
    };

    const canonical = coverageForCanonical(book.canonical_path, parsed);
    const drb = coverageForDrb(book.drb_path, parsed);

    bindings.push({
      unit_key: unit.key,
      block_label: labelByUnitRef.get(unit.key) || null,
      bible_ref: ref,
      required_latin_lane: REQUIRED_LATIN_LANE,
      latin_lane_status: 'missing_required_bible_corpus_lane',
      current_display_body_status: 'dev_source_witness_body_only_not_forward_corpus_model',
      canonical_shared_corpus: {
        path: book.canonical_path,
        ...canonical
      },
      interim_catholic_english_lane: {
        lane_id: INTERIM_CATHOLIC_ENGLISH_LANE,
        path: book.drb_path,
        ...drb
      }
    });
  }

  return bindings;
}

const units = readJson('data/roman-breviary-1960-1962/units/dev-vertical-slice.json');
const manifest = readJson('data/roman-breviary-1960-1962/manifests/2026.json');

const scripture_readings = buildScriptureBindings(units, manifest);
const psalm_appointments = extractPsalmAppointments(units);

const report = {
  schema_version: 'roman_breviary_1960_1962_bible_binding_report_v1',
  generated_for: {
    date: '2026-11-02',
    hour: 'matins',
    source_slice: 'dev-vertical-slice'
  },
  policy: {
    no_new_roman_side_biblical_body_materialization: true,
    scripture_bodies_must_resolve_from_bible_corpus: true,
    psalm_bodies_must_resolve_from_bible_corpus: true,
    required_latin_scripture_lane: REQUIRED_LATIN_LANE,
    required_latin_psalter_lane: REQUIRED_LATIN_PSALTER_LANE,
    interim_catholic_english_lane_available_for_binding_tests: INTERIM_CATHOLIC_ENGLISH_LANE
  },
  lane_status: {
    vulgate_clementine: 'missing',
    vulgate_psalter: 'missing',
    drb_original: exists('data/bible/translations/drb-original-douay-rheims/manifest.json') ? 'available' : 'missing'
  },
  scripture_readings,
  psalm_appointments,
  summary: {
    scripture_reading_count: scripture_readings.length,
    psalm_appointment_count: psalm_appointments.length,
    scripture_readings_with_shared_corpus_coverage: scripture_readings.filter(item => item.canonical_shared_corpus.verses_present === item.canonical_shared_corpus.verse_count).length,
    scripture_readings_with_drb_lane_coverage: scripture_readings.filter(item => item.interim_catholic_english_lane.verses_present === item.interim_catholic_english_lane.verse_count).length,
    required_missing_lanes: [REQUIRED_LATIN_LANE, REQUIRED_LATIN_PSALTER_LANE]
  }
};

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(report, null, 2) + '\n', 'utf8');

console.log(JSON.stringify({
  result: 'OK',
  output: path.relative(ROOT, OUT_PATH),
  scripture_reading_count: report.summary.scripture_reading_count,
  psalm_appointment_count: report.summary.psalm_appointment_count,
  scripture_readings_with_shared_corpus_coverage: report.summary.scripture_readings_with_shared_corpus_coverage,
  scripture_readings_with_drb_lane_coverage: report.summary.scripture_readings_with_drb_lane_coverage,
  required_missing_lanes: report.summary.required_missing_lanes
}, null, 2));
