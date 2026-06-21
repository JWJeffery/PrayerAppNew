import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ADAPTER_PATH = 'js/bible-browser/bible-source-lane-adapter.js';
const BINDING_REPORT_PATH = 'data/roman-breviary-1960-1962/bible-bindings/dev-vertical-slice.json';
const OUT_PATH = 'data/roman-breviary-1960-1962/bible-bindings/vulgate-source-lane-plan.json';

const REQUIRED_SCRIPTURE_LANE_ID = 'VULGATE_CLEMENTINE';
const REQUIRED_PSALTER_LANE_ID = 'VULGATE_PSALTER';
const REQUIRED_SCRIPTURE_TRANSLATION_KEY = 'Vulgate';
const REQUIRED_PSALTER_TRANSLATION_KEY = 'VulgatePsalter';

function readText(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function readJson(relPath) {
  return JSON.parse(readText(relPath));
}

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function extractLaneIds(adapterText) {
  const match = adapterText.match(/const LANES = \{([\s\S]*?)\n  \};/);
  if (!match) throw new Error('Unable to locate LANES object in Bible source-lane adapter.');

  const laneIds = [];
  const lanePattern = /^\s{4}([A-Z0-9_]+):\s*\{/gm;
  let laneMatch;
  while ((laneMatch = lanePattern.exec(match[1]))) laneIds.push(laneMatch[1]);
  return laneIds;
}

function extractBookMapKeys(adapterText, laneId) {
  const laneStart = adapterText.indexOf(`${laneId}: {`);
  if (laneStart < 0) return [];
  const bookMapStart = adapterText.indexOf('bookMap:', laneStart);
  if (bookMapStart < 0) return [];
  const bookMapOpen = adapterText.indexOf('{', bookMapStart);
  if (bookMapOpen < 0) return [];

  let depth = 0;
  let end = -1;
  for (let i = bookMapOpen; i < adapterText.length; i += 1) {
    if (adapterText[i] === '{') depth += 1;
    if (adapterText[i] === '}') depth -= 1;
    if (depth === 0) {
      end = i;
      break;
    }
  }
  if (end < 0) return [];

  const body = adapterText.slice(bookMapOpen + 1, end);
  const keys = [];
  const quoted = /"([^"]+)":/g;
  const bare = /^\s*([A-Z0-9_]+):/gm;
  let m;
  while ((m = quoted.exec(body))) keys.push(m[1]);
  while ((m = bare.exec(body))) keys.push(m[1]);
  return [...new Set(keys)].sort();
}

function canonicalFileForBook(bookId) {
  return {
    JOB: 'data/bible/OT/job.json',
    '1_CORINTHIANS': 'data/bible/NT/1corinthians.json',
    PSALMS: 'data/bible/OT/psalms.json'
  }[bookId] || null;
}

function targetFileForLane(bookId) {
  return {
    JOB: 'raw/job.json',
    '1_CORINTHIANS': 'raw/1-corinthians.json',
    PSALMS: 'raw/psalms.json'
  }[bookId] || null;
}

function uniqueScriptureBooks(bindingReport) {
  const map = new Map();
  for (const item of bindingReport.scripture_readings || []) {
    const ref = item.bible_ref;
    if (!ref?.book_id) continue;
    map.set(ref.book_id, ref.book_label || ref.book_id);
  }
  return [...map.entries()].map(([book_id, label]) => ({ book_id, label }));
}

function uniquePsalmBooks(bindingReport) {
  return (bindingReport.psalm_appointments || []).some(item => item.bible_ref?.book_id === 'PSALMS')
    ? [{ book_id: 'PSALMS', label: 'Psalms' }]
    : [];
}

function scripturePassagePlan(bindingReport) {
  return (bindingReport.scripture_readings || []).map(item => ({
    source_unit_key: item.unit_key,
    block_label: item.block_label,
    citation: item.bible_ref.citation,
    book_id: item.bible_ref.book_id,
    chapter: item.bible_ref.chapter,
    verse_start: item.bible_ref.verse_start,
    verse_end: item.bible_ref.verse_end,
    required_lane_id: REQUIRED_SCRIPTURE_LANE_ID,
    required_translation_key: REQUIRED_SCRIPTURE_TRANSLATION_KEY
  }));
}

function psalmAppointmentPlan(bindingReport) {
  return (bindingReport.psalm_appointments || []).map(item => ({
    source_unit_key: item.unit_key,
    nocturn: item.nocturn,
    book_id: 'PSALMS',
    psalm: item.bible_ref.chapter,
    numbering_status: item.bible_ref.numbering_status,
    required_lane_id: REQUIRED_PSALTER_LANE_ID,
    required_translation_key: REQUIRED_PSALTER_TRANSLATION_KEY
  }));
}

function laneFilePlan(bookList, laneId, basePath) {
  return bookList.map(book => {
    const canonicalProbePath = canonicalFileForBook(book.book_id);
    const targetLaneFile = targetFileForLane(book.book_id);
    return {
      book_id: book.book_id,
      label: book.label,
      canonical_probe_path: canonicalProbePath,
      canonical_probe_exists: canonicalProbePath ? exists(canonicalProbePath) : false,
      target_lane_id: laneId,
      target_lane_file: targetLaneFile,
      target_full_path: targetLaneFile ? `${basePath}/${targetLaneFile}` : null,
      target_exists_now: targetLaneFile ? exists(`${basePath}/${targetLaneFile}`) : false
    };
  });
}

function manifestShapePlan() {
  return {
    scripture_lane_manifest: {
      planned_path: 'data/bible/translations/vulgate-clementine/manifest.json',
      lane_id: REQUIRED_SCRIPTURE_LANE_ID,
      label: 'Vulgate Clementine',
      translation_key: REQUIRED_SCRIPTURE_TRANSLATION_KEY,
      use: 'internal_bible_browser_and_roman_breviary_binding',
      base_path: 'data/bible/translations/vulgate-clementine',
      file_prefix: 'raw/',
      status: 'planned_not_imported'
    },
    psalter_lane_manifest: {
      planned_path: 'data/bible/translations/vulgate-psalter/manifest.json',
      lane_id: REQUIRED_PSALTER_LANE_ID,
      label: 'Vulgate Psalter',
      translation_key: REQUIRED_PSALTER_TRANSLATION_KEY,
      use: 'roman_breviary_psalter_binding',
      base_path: 'data/bible/translations/vulgate-psalter',
      file_prefix: 'raw/',
      status: 'planned_not_imported'
    }
  };
}

function adapterInsertionPlan(existingLaneIds, adapterText) {
  return {
    adapter_path: ADAPTER_PATH,
    existing_lane_ids: existingLaneIds,
    required_missing_lane_ids: [
      ...(existingLaneIds.includes(REQUIRED_SCRIPTURE_LANE_ID) ? [] : [REQUIRED_SCRIPTURE_LANE_ID]),
      ...(existingLaneIds.includes(REQUIRED_PSALTER_LANE_ID) ? [] : [REQUIRED_PSALTER_LANE_ID])
    ],
    insertion_anchor: existingLaneIds.includes('DRB_ORIGINAL') ? 'after DRB_ORIGINAL lane or before NABRE_INTERNAL lane' : 'inside LANES object',
    book_map_keys_available_from_drb: extractBookMapKeys(adapterText, 'DRB_ORIGINAL'),
    book_map_keys_needed_for_pilot: ['JOB', 'PSALMS', '1_CORINTHIANS']
  };
}

const adapterText = readText(ADAPTER_PATH);
const bindingReport = readJson(BINDING_REPORT_PATH);
const existingLaneIds = extractLaneIds(adapterText);

const scriptureBooks = uniqueScriptureBooks(bindingReport);
const psalmBooks = uniquePsalmBooks(bindingReport);

const report = {
  schema_version: 'roman_breviary_1960_1962_vulgate_source_lane_plan_v1',
  generated_for: {
    date: '2026-11-02',
    hour: 'matins',
    source_binding_report: BINDING_REPORT_PATH
  },
  policy: {
    no_roman_side_biblical_body_materialization: true,
    no_import_performed_by_this_script: true,
    bible_bodies_must_resolve_from_bible_lanes: true,
    no_liturgical_body_text_in_this_plan: true
  },
  current_repo_state: {
    adapter_path: ADAPTER_PATH,
    binding_report_path: BINDING_REPORT_PATH,
    existing_lane_ids: existingLaneIds,
    drb_original_available: existingLaneIds.includes('DRB_ORIGINAL'),
    nabre_internal_available: existingLaneIds.includes('NABRE_INTERNAL'),
    vulgate_clementine_available: existingLaneIds.includes(REQUIRED_SCRIPTURE_LANE_ID),
    vulgate_psalter_available: existingLaneIds.includes(REQUIRED_PSALTER_LANE_ID)
  },
  required_lanes: {
    scripture: REQUIRED_SCRIPTURE_LANE_ID,
    psalter: REQUIRED_PSALTER_LANE_ID
  },
  planned_manifest_shape: manifestShapePlan(),
  adapter_insertion_plan: adapterInsertionPlan(existingLaneIds, adapterText),
  pilot_scope: {
    scripture_books: scriptureBooks,
    scripture_passages: scripturePassagePlan(bindingReport),
    psalm_books: psalmBooks,
    psalm_appointments: psalmAppointmentPlan(bindingReport)
  },
  file_plan: {
    scripture_lane_files: laneFilePlan(scriptureBooks, REQUIRED_SCRIPTURE_LANE_ID, 'data/bible/translations/vulgate-clementine'),
    psalter_lane_files: laneFilePlan(psalmBooks, REQUIRED_PSALTER_LANE_ID, 'data/bible/translations/vulgate-psalter')
  },
  next_allowed_write_tranche: {
    description: 'Create empty governed Vulgate source-lane scaffold and adapter registration only; do not import biblical text.',
    may_create: [
      'data/bible/translations/vulgate-clementine/manifest.json',
      'data/bible/translations/vulgate-clementine/raw/',
      'data/bible/translations/vulgate-psalter/manifest.json',
      'data/bible/translations/vulgate-psalter/raw/'
    ],
    may_modify: [
      ADAPTER_PATH
    ],
    must_not_create: [
      'Roman-side copies of Job, 1 Corinthians, or Psalm body text',
      'Resolved Roman Breviary daily snapshots'
    ],
    import_after_scaffold: [
      'JOB',
      '1_CORINTHIANS',
      'PSALMS'
    ]
  }
};

fs.mkdirSync(path.dirname(path.join(ROOT, OUT_PATH)), { recursive: true });
fs.writeFileSync(path.join(ROOT, OUT_PATH), JSON.stringify(report, null, 2) + '\n', 'utf8');

console.log(JSON.stringify({
  result: 'OK',
  output: OUT_PATH,
  existing_lane_ids: existingLaneIds,
  required_missing_lane_ids: report.adapter_insertion_plan.required_missing_lane_ids,
  scripture_books: scriptureBooks.map(book => book.book_id),
  scripture_passages: report.pilot_scope.scripture_passages.length,
  psalm_appointments: report.pilot_scope.psalm_appointments.length,
  no_import_performed: true,
  no_liturgical_body_text_in_this_plan: true
}, null, 2));
