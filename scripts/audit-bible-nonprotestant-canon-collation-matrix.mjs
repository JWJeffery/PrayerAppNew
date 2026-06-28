#!/usr/bin/env node
import fs from 'node:fs';

const trustPath = 'data/bible/registry/bible-corpus-trust-status.json';
const governancePath = 'data/bible/registry/deuterocanon-remaining-governance.json';
const decisionPath = 'data/bible/registry/nonprotestant-canon-text-trust-decision.json';
const reportPath = 'data/bible/registry/nonprotestant-canon-collation-matrix.json';

const coreTranslations = ['NRSV', 'KJV', 'NABRE', 'DRB', 'Rotherham'];

const inScopeBooks = [
  { key: 'tobit', path: 'data/bible/OT/tobit.json', group: 'deuterocanon' },
  { key: 'judith', path: 'data/bible/OT/judith.json', group: 'deuterocanon' },
  { key: 'estherGK', path: 'data/bible/OT/estherGK.json', group: 'greek_additions' },
  { key: 'wisdom', path: 'data/bible/OT/wisdom.json', group: 'deuterocanon' },
  { key: 'sirach', path: 'data/bible/OT/sirach.json', group: 'deuterocanon' },
  { key: 'baruch', path: 'data/bible/OT/baruch.json', group: 'deuterocanon' },
  { key: 'letterofjeremiah', path: 'data/bible/OT/letterofjeremiah.json', group: 'deuterocanon' },
  { key: 'danielGK', path: 'data/bible/OT/danielGK.json', group: 'greek_additions' },
  { key: '1maccabees', path: 'data/bible/OT/1maccabees.json', group: 'deuterocanon' },
  { key: '2maccabees', path: 'data/bible/OT/2maccabees.json', group: 'deuterocanon' },
  { key: '1esdras', path: 'data/bible/OT/1esdras.json', group: 'apocrypha' },
  { key: '2esdras', path: 'data/bible/OT/2esdras.json', group: 'apocrypha' },
  { key: 'prayerofmanasseh', path: 'data/bible/OT/prayerofmanasseh.json', group: 'apocrypha' },
  { key: '3maccabees', path: 'data/bible/OT/3maccabees.json', group: 'broader_deuterocanon' },
  { key: '4maccabees', path: 'data/bible/OT/4maccabees.json', group: 'broader_deuterocanon' },
  { key: '1enoch', path: 'data/bible/OT/1enoch.json', group: 'broader_canon' },
  { key: 'armenian_canticles', path: 'data/bible/ODES/armeniancanticlesAR.json', group: 'odes' },
  { key: 'coptic_odes', path: 'data/bible/ODES/copticodesCO.json', group: 'odes' },
  { key: 'eastern_orthodox_odes', path: 'data/bible/ODES/eoodes.json', group: 'odes' },
  { key: 'ethiopian_odes', path: 'data/bible/ODES/ethiopianodes.json', group: 'odes' },
  { key: 'odes_of_solomon', path: 'data/bible/ODES/odesofsolomonSY.json', group: 'odes' },
  { key: 'syriac_letter_of_baruch', path: 'data/bible/SY/letterofbaruchSY.json', group: 'broader_canon' }
];

const failures = [];

function readJson(path) {
  if (!fs.existsSync(path)) {
    failures.push({ type: 'missing-required-file', path });
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    failures.push({ type: 'invalid-json', path, error: String(error.message || error) });
    return null;
  }
}

function walk(node, visitor, path = []) {
  visitor(node, path);

  if (Array.isArray(node)) {
    node.forEach((child, index) => walk(child, visitor, path.concat(index)));
  } else if (node && typeof node === 'object') {
    for (const [key, child] of Object.entries(node)) {
      walk(child, visitor, path.concat(key));
    }
  }
}

function collectTextCells(book) {
  const rows = [];
  const laneCounts = {};
  const nonEmptyLaneCounts = {};
  let unkeyedTextRows = 0;

  walk(book, (node, path) => {
    if (!node || typeof node !== 'object' || !Object.prototype.hasOwnProperty.call(node, 'text')) return;

    const text = node.text;
    const ref = [
      node.book || null,
      node.chapter ?? node.ch ?? null,
      node.num ?? node.number ?? node.verse ?? null
    ].filter((value) => value !== null && value !== undefined).join(':') || path.join('.');

    if (typeof text === 'string') {
      unkeyedTextRows += 1;
      laneCounts.UNKEYED = (laneCounts.UNKEYED || 0) + 1;
      if (text.trim()) nonEmptyLaneCounts.UNKEYED = (nonEmptyLaneCounts.UNKEYED || 0) + 1;
      rows.push({ ref, lane: 'UNKEYED', nonEmpty: Boolean(text.trim()) });
      return;
    }

    if (text && typeof text === 'object') {
      for (const [lane, value] of Object.entries(text)) {
        laneCounts[lane] = (laneCounts[lane] || 0) + 1;
        const nonEmpty = typeof value === 'string' ? Boolean(value.trim()) : value !== null && value !== undefined;
        if (nonEmpty) nonEmptyLaneCounts[lane] = (nonEmptyLaneCounts[lane] || 0) + 1;
        rows.push({ ref, lane, nonEmpty });
      }
    }
  });

  return {
    rowCount: rows.length,
    laneCounts,
    nonEmptyLaneCounts,
    unkeyedTextRows
  };
}

function collectStatusRecords(root) {
  const records = [];

  walk(root, (node, path) => {
    if (!node || typeof node !== 'object' || Array.isArray(node)) return;

    const hasSignal =
      typeof node.status === 'string' ||
      typeof node.activePath === 'string' ||
      typeof node.activeLane === 'string' ||
      typeof node.sourcePath === 'string' ||
      typeof node.policyDecision === 'string' ||
      typeof node.boundedClaim === 'string';

    if (!hasSignal) return;

    records.push({
      path: path.join('.'),
      id: node.id || null,
      status: node.status || null,
      activePath: node.activePath || null,
      activeLane: node.activeLane || null,
      sourcePath: node.sourcePath || null,
      sourceRef: node.sourceRef || null,
      sourceWitness: node.sourceWitness || node.sourceName || null,
      summary: node.summary || node.policyDecision || node.boundedClaim || null,
      raw: node
    });
  });

  return records;
}

function recordMentionsLane(record, lane) {
  const laneText = JSON.stringify({
    id: record.id,
    activeLane: record.activeLane,
    status: record.status,
    summary: record.summary,
    sourceWitness: record.sourceWitness
  });
  return laneText.includes(lane);
}

function classifyCell({ book, lane, activeRows, records, governance }) {
  const relevant = records.filter((record) => {
    if (record.activePath === book.path) return true;
    const text = JSON.stringify(record);
    return text.includes(book.path) || text.includes(book.key);
  });

  const laneRelevant = relevant.filter((record) => recordMentionsLane(record, lane));
  const anyRelevantText = JSON.stringify(relevant);

  const sourceAbsent =
    anyRelevantText.includes(`no_historical_${book.key}`) ||
    anyRelevantText.includes('no historical') ||
    anyRelevantText.includes('governed_no_historical') ||
    anyRelevantText.includes('source absent') ||
    anyRelevantText.includes('no active nabre rows') ||
    anyRelevantText.includes('no active NABRE rows');

  const exactVerified = laneRelevant.some((record) => {
    const text = JSON.stringify(record);
    return text.includes('exact_verified') ||
      text.includes('exact source') ||
      text.includes('exactly matches') ||
      text.includes('source_backed');
  });

  const governedAbsenceOrDivergence = relevant.some((record) => {
    const text = JSON.stringify(record);
    return text.includes('activeRefsWithout') ||
      text.includes('sourceRefsWithout') ||
      text.includes('governed_absence') ||
      text.includes('no_synthetic') ||
      text.includes('versification_policy');
  });

  const formMappingRequired =
    book.key === 'estherGK' ||
    book.key === 'danielGK' ||
    JSON.stringify(governance.inspectedGreekBooks || {}).includes(book.key);

  const variantRequired =
    book.key === '4maccabees';

  if (activeRows > 0 && formMappingRequired) {
    return {
      status: 'active_text_present_form_mapping_required',
      workLeft: 'Map source form to user-facing book/chapter/verse for each translation; do not overlay blindly.'
    };
  }

  if (activeRows > 0 && variantRequired) {
    return {
      status: 'active_text_present_variant_policy_required',
      workLeft: 'Handle 4 Maccabees 10:4 and 11:7-8 as visible variant or explicit non-primary material.'
    };
  }

  if (activeRows > 0 && exactVerified && governedAbsenceOrDivergence) {
    return {
      status: 'source_scope_verified_but_final_address_review_required',
      workLeft: 'Confirm every displayed verse matches source and every source/address absence is visible and non-synthetic.'
    };
  }

  if (activeRows > 0 && exactVerified) {
    return {
      status: 'source_scope_verified_needs_final_collation_gate',
      workLeft: 'Run final independent source collation before trust promotion.'
    };
  }

  if (activeRows > 0) {
    return {
      status: 'active_text_unverified',
      workLeft: 'Compare active text directly against source Bible for this lane.'
    };
  }

  if (activeRows === 0 && sourceAbsent) {
    return {
      status: 'source_absent_allowed_needs_visibility_check',
      workLeft: 'Ensure the app does not offer synthetic text and exposes/handles the absence cleanly.'
    };
  }

  return {
    status: 'lane_absent_source_status_unknown',
    workLeft: 'Determine whether this translation has a legitimate source witness for this book.'
  };
}

const decision = readJson(decisionPath);
const trust = readJson(trustPath);
const governance = readJson(governancePath);

if (decision?.schema !== 'nonprotestant-canon-text-trust-decision-v1') {
  failures.push({ type: 'decision-schema-mismatch', path: decisionPath });
}

const records = collectStatusRecords({ trust, governance });
const books = [];

for (const book of inScopeBooks) {
  if (!fs.existsSync(book.path)) {
    books.push({
      ...book,
      filePresent: false,
      status: 'active_file_missing',
      workLeft: 'Confirm whether this in-scope book should exist in the active corpus.'
    });
    continue;
  }

  const active = readJson(book.path);
  if (!active) continue;

  const cells = collectTextCells(active);
  const detectedLanes = Array.from(new Set([
    ...coreTranslations,
    ...Object.keys(cells.nonEmptyLaneCounts),
    ...Object.keys(cells.laneCounts)
  ])).sort();

  const matrix = {};
  for (const lane of detectedLanes) {
    const activeRows = cells.nonEmptyLaneCounts[lane] || 0;
    matrix[lane] = {
      activeRows,
      totalTextSlots: cells.laneCounts[lane] || 0,
      ...classifyCell({ book, lane, activeRows, records, governance: governance || {} })
    };
  }

  const statuses = Object.values(matrix).map((cell) => cell.status);
  const failingOrUnfinished = statuses.filter((status) => ![
    'source_absent_allowed_needs_visibility_check',
    'source_scope_verified_needs_final_collation_gate'
  ].includes(status));

  books.push({
    ...book,
    filePresent: true,
    textRows: cells.rowCount,
    laneCounts: cells.nonEmptyLaneCounts,
    unkeyedTextRows: cells.unkeyedTextRows,
    matrix,
    unfinishedCellCount: failingOrUnfinished.length,
    bookStatus: failingOrUnfinished.length ? 'not_trust_ready' : 'needs_final_collation_gate'
  });
}

const summary = {
  inScopeBookCount: books.length,
  activeFileMissingCount: books.filter((book) => !book.filePresent).length,
  notTrustReadyBookCount: books.filter((book) => book.bookStatus === 'not_trust_ready' || book.status === 'active_file_missing').length,
  activeTextUnverifiedCellCount: books.flatMap((book) => Object.values(book.matrix || {})).filter((cell) => cell.status === 'active_text_unverified').length,
  formMappingRequiredBookCount: books.filter((book) => Object.values(book.matrix || {}).some((cell) => cell.status === 'active_text_present_form_mapping_required')).length,
  variantPolicyRequiredBookCount: books.filter((book) => Object.values(book.matrix || {}).some((cell) => cell.status === 'active_text_present_variant_policy_required')).length,
  sourceAbsentAllowedCellCount: books.flatMap((book) => Object.values(book.matrix || {})).filter((cell) => cell.status === 'source_absent_allowed_needs_visibility_check').length
};

const report = {
  schema: 'nonprotestant-canon-collation-matrix-v1',
  id: 'nonprotestant_canon_collation_matrix_2026_06_28',
  status: 'work_matrix_created_not_trust_ready',
  generatedAt: new Date().toISOString(),
  controllingDecision: decisionPath,
  trustStandard: decision?.plainEnglishStandard || null,
  summary,
  books,
  failures
};

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify({
  audit: 'nonprotestant-canon-collation-matrix',
  status: failures.length ? 'failed' : 'passed',
  reportPath,
  summary,
  failures
}, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Review matrix generation failures. No Bible text was mutated.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Open the matrix report and use it to drive exact source collation by book and translation lane.');
}
