function objectFromCounts(counts) {
  return Object.fromEntries([...counts.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

function topCounts(counts, limit = 12) {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([classification, count]) => ({ class: classification, count }));
}

function topRecordCounts(records, keyFn, limit = 12) {
  const counts = new Map();
  for (const record of records) {
    const key = keyFn(record);
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

function corpusRoot(file) {
  const parts = String(file || '').split('/');
  return parts.length >= 3 ? parts.slice(0, 3).join('/') : file || null;
}

function fileScope(file) {
  if (String(file).startsWith('data/bible/ET/')) return 'eastern_single_text_inventory';
  if (String(file).startsWith('data/bible/OT/')) return 'ot_or_broader_canon_inventory';
  if (String(file).startsWith('data/bible/NT/')) return 'nt_or_christian_witness_inventory';
  return 'other_bible_inventory';
}

function groupTopFilesByScope(records, limit = 8) {
  const groups = new Map();
  for (const record of records) {
    const scope = fileScope(record.file);
    if (!groups.has(scope)) groups.set(scope, []);
    groups.get(scope).push(record);
  }

  return Object.fromEntries(
    [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([scope, scopeRecords]) => [scope, topRecordCounts(scopeRecords, record => record.file, limit)])
  );
}

function groupTopFilesByLane(records, limit = 8) {
  const groups = new Map();
  for (const record of records) {
    const lane = record.lane;
    if (!lane) continue;
    if (!groups.has(lane)) groups.set(lane, []);
    groups.get(lane).push(record);
  }

  return Object.fromEntries(
    [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([lane, laneRecords]) => [lane, topRecordCounts(laneRecords, record => record.file, limit)])
  );
}

function releasePostureForClassification(classification) {
  if (classification === 'exact_source_collated') return 'source_collated_evidence';
  if (classification === 'registered_text') return 'registered_not_collated';
  if (classification === 'blocked_licensed_or_unresolved_source') return 'blocked_source_or_license';
  if (classification === 'missing_source') return 'missing_source';
  if (classification === 'active_text_untyped') return 'untyped_active_text';
  return 'other_unresolved';
}

function countByPostureAndScope(records) {
  const scoped = new Map();
  for (const record of records) {
    const scope = fileScope(record.file);
    const posture = releasePostureForClassification(record.classification);
    if (!scoped.has(scope)) scoped.set(scope, new Map());
    const counts = scoped.get(scope);
    counts.set(posture, (counts.get(posture) || 0) + 1);
  }

  return Object.fromEntries(
    [...scoped.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([scope, counts]) => [scope, objectFromCounts(counts)])
  );
}

function countByScopeAndPosture(records) {
  const postures = new Map();
  for (const record of records) {
    const posture = releasePostureForClassification(record.classification);
    const scope = fileScope(record.file);
    if (!postures.has(posture)) postures.set(posture, new Map());
    const counts = postures.get(posture);
    counts.set(scope, (counts.get(scope) || 0) + 1);
  }

  return Object.fromEntries(
    [...postures.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([posture, counts]) => [posture, objectFromCounts(counts)])
  );
}

function groupedCounts(records, groupKeyFn, countKeyFn) {
  const groups = new Map();
  for (const record of records) {
    const groupKey = groupKeyFn(record);
    const countKey = countKeyFn(record);
    if (!groupKey || !countKey) continue;
    if (!groups.has(groupKey)) groups.set(groupKey, new Map());
    const counts = groups.get(groupKey);
    counts.set(countKey, (counts.get(countKey) || 0) + 1);
  }

  return Object.fromEntries(
    [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([groupKey, counts]) => [groupKey, objectFromCounts(counts)])
  );
}

function buildCollationEvidenceRecordSummary(records) {
  const evidenceRecords = records.filter(record => record.evidenceRecord);
  return {
    meaning: 'Evidence record summary groups active cells by existing governed collation/status records. It is inherited evidence only; this report does not perform live source collation.',
    totalCellsWithEvidenceRecord: evidenceRecords.length,
    countsByEvidenceRecord: topRecordCounts(evidenceRecords, record => record.evidenceRecord, 20),
    classificationsByEvidenceRecord: groupedCounts(evidenceRecords, record => record.evidenceRecord, record => record.classification),
    posturesByEvidenceRecord: groupedCounts(evidenceRecords, record => record.evidenceRecord, record => releasePostureForClassification(record.classification)),
    topFilesByEvidenceRecord: Object.fromEntries(
      [...new Set(evidenceRecords.map(record => record.evidenceRecord))]
        .sort()
        .map(recordId => [recordId, topRecordCounts(evidenceRecords.filter(record => record.evidenceRecord === recordId), record => record.file, 8)])
    )
  };
}

function buildCoverageSummary(records) {
  const withEvidence = records.filter(record => record.evidenceRecord);
  const withoutEvidence = records.filter(record => !record.evidenceRecord);
  const registeredWithoutEvidence = withoutEvidence.filter(record => record.classification === 'registered_text');
  return {
    meaning: 'Coverage summary compares active cells that have inherited governed record evidence with active cells still outside inherited evidence coverage. It is triage-only and not a trust assertion.',
    totalActiveCells: records.length,
    cellsWithEvidenceRecord: withEvidence.length,
    cellsWithoutEvidenceRecord: withoutEvidence.length,
    withEvidenceByClassification: objectFromCounts(countRecords(withEvidence, record => record.classification)),
    withoutEvidenceByClassification: objectFromCounts(countRecords(withoutEvidence, record => record.classification)),
    withEvidenceByPosture: objectFromCounts(countRecords(withEvidence, record => releasePostureForClassification(record.classification))),
    withoutEvidenceByPosture: objectFromCounts(countRecords(withoutEvidence, record => releasePostureForClassification(record.classification))),
    withEvidenceByFileScope: objectFromCounts(countRecords(withEvidence, record => fileScope(record.file))),
    withoutEvidenceByFileScope: objectFromCounts(countRecords(withoutEvidence, record => fileScope(record.file))),
    withoutEvidenceByLane: objectFromCounts(countRecords(withoutEvidence, record => record.lane)),
    registeredWithoutEvidenceByLane: objectFromCounts(countRecords(registeredWithoutEvidence, record => record.lane)),
    topFilesWithoutEvidenceRecord: topRecordCounts(withoutEvidence, record => record.file, 12),
    topFilesWithoutEvidenceRecordByFileScope: groupTopFilesByScope(withoutEvidence, 8),
    topRegisteredFilesWithoutEvidenceByLane: groupTopFilesByLane(registeredWithoutEvidence, 8)
  };
}

function countRecords(records, keyFn) {
  const counts = new Map();
  for (const record of records) {
    const key = keyFn(record);
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

function buildReleasePostureSummary(records) {
  const counts = new Map();
  for (const record of records) {
    const posture = releasePostureForClassification(record.classification);
    counts.set(posture, (counts.get(posture) || 0) + 1);
  }

  return {
    meaning: 'Release posture summarizes report classifications for triage only. It is not a trust assertion and does not authorize public release.',
    counts: objectFromCounts(counts),
    countsByFileScope: countByPostureAndScope(records),
    fileScopesByPosture: countByScopeAndPosture(records),
    topFilesByPosture: Object.fromEntries(
      [...new Set(records.map(record => releasePostureForClassification(record.classification)))]
        .sort()
        .map(posture => [posture, topRecordCounts(records.filter(record => releasePostureForClassification(record.classification) === posture), record => record.file, 8)])
    )
  };
}

function buildFileScopeBreakdowns(records) {
  const activeTextUntyped = records.filter(record => record.classification === 'active_text_untyped');
  const unresolved = records.filter(record => record.classification !== 'registered_text' && record.classification !== 'exact_source_collated');
  return {
    activeTextUntypedByCorpusRoot: topRecordCounts(activeTextUntyped, record => corpusRoot(record.file)),
    activeTextUntypedByFileScope: topRecordCounts(activeTextUntyped, record => fileScope(record.file)),
    activeTextUntypedTopFilesByFileScope: groupTopFilesByScope(activeTextUntyped),
    unresolvedByCorpusRoot: topRecordCounts(unresolved, record => corpusRoot(record.file)),
    unresolvedByFileScope: topRecordCounts(unresolved, record => fileScope(record.file)),
    unresolvedTopFilesByFileScope: groupTopFilesByScope(unresolved)
  };
}

function buildClassificationBreakdowns(records) {
  const unresolved = records.filter(record => record.classification !== 'registered_text' && record.classification !== 'exact_source_collated');
  return {
    topUnresolvedFiles: topRecordCounts(unresolved, record => record.file),
    topUntypedTextFiles: topRecordCounts(records.filter(record => record.classification === 'active_text_untyped'), record => record.file),
    topUntypedTextShapes: topRecordCounts(records.filter(record => record.classification === 'active_text_untyped'), record => record.sourceShape),
    topBlockedFiles: topRecordCounts(records.filter(record => record.classification === 'blocked_licensed_or_unresolved_source'), record => record.file),
    topMissingSourceFiles: topRecordCounts(records.filter(record => record.classification === 'missing_source'), record => record.file),
    fileScopeBreakdowns: buildFileScopeBreakdowns(records)
  };
}

export function buildCompactReport({ inventory, classified, registry, collationEvidence = null }) {
  const records = classified.records || [];
  return {
    phase: 'source_collation_record_ingestion',
    trustAssertionsMade: false,
    bibleTextMutated: false,
    sourceCollationPerformed: false,
    sourceCollationEvidenceIngested: Boolean(collationEvidence),
    registeredTextMeaning: registry.registeredTextMeaning || 'Known registry lane/source label only; not source-verified and not trusted by this report.',
    sourceCollationMeaning: 'Exact-source-collated classifications are inherited only from existing governed result records; this report does not perform new live collation.',
    totalActiveFilesScanned: inventory.filesScanned,
    totalActiveCellsScanned: inventory.cells.length,
    classificationCounts: objectFromCounts(classified.classificationCounts),
    coverageSummary: buildCoverageSummary(records),
    releasePostureSummary: buildReleasePostureSummary(records),
    collationEvidenceRecordSummary: buildCollationEvidenceRecordSummary(records),
    sourceEvidenceCounts: objectFromCounts(classified.sourceEvidenceCounts || new Map()),
    topUnresolvedClasses: topCounts(classified.unresolvedCounts),
    classificationBreakdowns: buildClassificationBreakdowns(records),
    evidenceWarnings: classified.evidenceWarnings || [],
    skippedEvidenceRecords: classified.skippedEvidenceRecords || [],
    parseErrors: inventory.parseErrors
  };
}
