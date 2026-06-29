import fs from 'node:fs';
import path from 'node:path';

export const DEFAULT_COLLATION_RECORD_INDEX_PATH = 'data/bible/registry/active-text-collation-record-index.json';

function readJson(repoRoot, relativePath) {
  return JSON.parse(fs.readFileSync(path.resolve(repoRoot, relativePath), 'utf8'));
}

function makeLaneKey(file, lane) {
  return `${file}::${lane}`;
}

function increment(map, key, amount) {
  map.set(key, (map.get(key) || 0) + amount);
}

function addEvidence(evidenceByLane, evidence) {
  const key = makeLaneKey(evidence.activePath, evidence.lane);
  const existing = evidenceByLane.get(key);
  if (!existing) {
    evidenceByLane.set(key, evidence);
    return;
  }

  if (existing.classification === evidence.classification && existing.expectedRows != null && evidence.expectedRows != null) {
    existing.expectedRows += evidence.expectedRows;
    existing.exactRows = (existing.exactRows || 0) + (evidence.exactRows || 0);
    existing.sources.push(...evidence.sources);
    return;
  }

  existing.mergeWarnings = existing.mergeWarnings || [];
  existing.mergeWarnings.push({ incoming: evidence });
}

function addTrustedScopesResult(repoRoot, item, evidenceByLane, sourceCounts) {
  const record = readJson(repoRoot, item.resultRecord);
  const trustedScopes = record.trustedScopes || {};
  const unresolvedScopes = record.unresolvedScopes || {};

  for (const [lane, scope] of Object.entries(trustedScopes)) {
    const exactRows = Number(scope.exactRows || 0);
    const activeRows = Number(scope.activeRows || 0);
    addEvidence(evidenceByLane, {
      activePath: item.activePath,
      lane,
      classification: 'exact_source_collated',
      expectedRows: activeRows,
      exactRows,
      status: scope.status || null,
      sources: [{ record: item.resultRecord, sourcePath: scope.path || null, sourceRef: scope.sourceRef || null }]
    });
    increment(sourceCounts, 'exact_source_collated', exactRows);
  }

  for (const [lane, scope] of Object.entries(unresolvedScopes)) {
    const activeRows = Number(scope.activeRows || 0);
    const status = String(scope.status || '');
    if (activeRows <= 0) {
      increment(sourceCounts, 'source_absent_by_policy', 0);
      continue;
    }
    const classification = status.includes('rawtext') ? 'missing_source' : 'blocked_licensed_or_unresolved_source';
    addEvidence(evidenceByLane, {
      activePath: item.activePath,
      lane,
      classification,
      expectedRows: activeRows,
      exactRows: 0,
      status: scope.status || null,
      sources: [{ record: item.resultRecord, sourcePath: null, sourceRef: null }]
    });
    increment(sourceCounts, classification, activeRows);
  }
}

function addByUnitTranslationPrefixResult(repoRoot, item, evidenceByLane, sourceCounts) {
  const record = readJson(repoRoot, item.resultRecord);
  const units = record.exactCollationResult?.byUnit || {};

  for (const [unitName, unit] of Object.entries(units)) {
    const lane = unitName.includes(':') ? unitName.split(':')[0] : item.lane;
    if (!lane) continue;
    const exactRows = Number(unit.exact || unit.checked || 0);
    addEvidence(evidenceByLane, {
      activePath: item.activePath,
      lane,
      classification: 'exact_source_collated',
      expectedRows: exactRows,
      exactRows,
      status: record.status || null,
      sources: [{ record: item.resultRecord, unit: unitName, sourcePath: record.sourcePath || null, sourceRef: record.sourceRef || null }]
    });
    increment(sourceCounts, 'exact_source_collated', exactRows);
  }

  for (const block of item.blockAllLanes || []) {
    addEvidence(evidenceByLane, {
      activePath: item.activePath,
      lane: block.lane,
      classification: block.classification || 'blocked_licensed_or_unresolved_source',
      expectedRows: null,
      exactRows: 0,
      status: block.reason || null,
      sources: [{ record: item.statusRecord || item.resultRecord, sourcePath: null, sourceRef: null }]
    });
  }
}

function addByUnitSingleLaneResult(repoRoot, item, evidenceByLane, sourceCounts) {
  const record = readJson(repoRoot, item.resultRecord);
  const units = record.exactCollationResult?.byUnit || {};
  for (const [unitName, unit] of Object.entries(units)) {
    const exactRows = Number(unit.exact || unit.checked || 0);
    addEvidence(evidenceByLane, {
      activePath: item.activePath,
      lane: item.lane,
      classification: 'exact_source_collated',
      expectedRows: exactRows,
      exactRows,
      status: record.status || null,
      sources: [{ record: item.resultRecord, unit: unitName, sourcePath: record.sourcePath || null, sourceRef: record.sourceRef || null }]
    });
    increment(sourceCounts, 'exact_source_collated', exactRows);
  }
}

export function loadCollationRecordEvidence(options = {}) {
  const repoRoot = options.repoRoot || process.cwd();
  const indexPath = options.indexPath || DEFAULT_COLLATION_RECORD_INDEX_PATH;
  const index = readJson(repoRoot, indexPath);
  const evidenceByLane = new Map();
  const sourceCounts = new Map();
  const skippedRecords = [];

  for (const item of index.records || []) {
    if (item.kind === 'trustedScopesResult') addTrustedScopesResult(repoRoot, item, evidenceByLane, sourceCounts);
    else if (item.kind === 'byUnitTranslationPrefixResult') addByUnitTranslationPrefixResult(repoRoot, item, evidenceByLane, sourceCounts);
    else if (item.kind === 'byUnitSingleLaneResult') addByUnitSingleLaneResult(repoRoot, item, evidenceByLane, sourceCounts);
    else skippedRecords.push({ id: item.id, kind: item.kind, reason: 'not applicable to external source collation evidence' });
  }

  return {
    indexPath,
    phase: index.phase || null,
    sourceCollationEvidenceIngested: true,
    evidenceByLane,
    sourceCounts,
    skippedRecords,
    getEvidence(file, lane) {
      return evidenceByLane.get(makeLaneKey(file, lane));
    }
  };
}
