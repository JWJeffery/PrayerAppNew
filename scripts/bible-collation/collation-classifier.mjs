function makeLaneKey(file, lane) {
  return `${file}::${lane}`;
}

function countInventoryByLane(cells) {
  const counts = new Map();
  for (const cell of cells) {
    const key = makeLaneKey(cell.file, cell.lane);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

function evidenceApplies(evidence, observedRows) {
  if (!evidence) return false;
  if (evidence.expectedRows == null) return true;
  return Number(evidence.expectedRows) === Number(observedRows);
}

function isGenericTextLane(cell) {
  return cell.lane === 'text' || cell.sourceShape === 'fallback_text_leaf' || cell.sourceShape === 'chapter_verse_string_text';
}

export function classifyCell(cell, registry, evidence, observedRows) {
  if (cell.blank) return { classification: 'blank_text', unresolvedKey: `blank_text:${cell.lane}` };
  if (cell.placeholder) return { classification: 'placeholder_text', unresolvedKey: `placeholder_text:${cell.lane}` };

  if (evidenceApplies(evidence, observedRows)) {
    if (evidence.classification === 'exact_source_collated') {
      return { classification: 'exact_source_collated', unresolvedKey: null, evidence };
    }
    return { classification: evidence.classification, unresolvedKey: `${evidence.classification}:${cell.lane}`, evidence };
  }

  if (isGenericTextLane(cell)) {
    return { classification: 'active_text_untyped', unresolvedKey: `active_text_untyped:${cell.sourceShape || cell.lane}` };
  }

  if (!registry.isRegistered(cell.lane)) {
    return { classification: 'unregistered_source', unresolvedKey: `unregistered_source:${cell.lane}` };
  }

  return { classification: 'registered_text', unresolvedKey: null };
}

export function classifyInventory(inventory, registry, collationEvidence = null) {
  const records = [];
  const classificationCounts = new Map();
  const unresolvedCounts = new Map();
  const laneCounts = countInventoryByLane(inventory.cells);
  const evidenceWarnings = [];

  for (const evidence of collationEvidence?.evidenceByLane?.values?.() || []) {
    const key = makeLaneKey(evidence.activePath, evidence.lane);
    const observedRows = laneCounts.get(key) || 0;
    if (!evidenceApplies(evidence, observedRows)) {
      evidenceWarnings.push({
        activePath: evidence.activePath,
        lane: evidence.lane,
        classification: evidence.classification,
        expectedRows: evidence.expectedRows,
        observedRows,
        status: 'record_not_applied_row_count_mismatch'
      });
    }
  }

  for (const cell of inventory.cells) {
    const key = makeLaneKey(cell.file, cell.lane);
    const evidence = collationEvidence?.getEvidence?.(cell.file, cell.lane) || null;
    const result = classifyCell(cell, registry, evidence, laneCounts.get(key) || 0);
    const record = {
      ...cell,
      classification: result.classification,
      evidenceRecord: result.evidence?.sources?.[0]?.record || null
    };
    records.push(record);
    classificationCounts.set(result.classification, (classificationCounts.get(result.classification) || 0) + 1);
    if (result.unresolvedKey) unresolvedCounts.set(result.unresolvedKey, (unresolvedCounts.get(result.unresolvedKey) || 0) + 1);
  }

  return {
    records,
    classificationCounts,
    unresolvedCounts,
    evidenceWarnings,
    sourceEvidenceCounts: collationEvidence?.sourceCounts || new Map(),
    skippedEvidenceRecords: collationEvidence?.skippedRecords || []
  };
}
