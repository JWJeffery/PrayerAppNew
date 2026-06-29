function objectFromCounts(counts) {
  return Object.fromEntries([...counts.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

function topCounts(counts, limit = 12) {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([classification, count]) => ({ class: classification, count }));
}

export function buildCompactReport({ inventory, classified, registry, collationEvidence = null }) {
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
    sourceEvidenceCounts: objectFromCounts(classified.sourceEvidenceCounts || new Map()),
    topUnresolvedClasses: topCounts(classified.unresolvedCounts),
    evidenceWarnings: classified.evidenceWarnings || [],
    skippedEvidenceRecords: classified.skippedEvidenceRecords || [],
    parseErrors: inventory.parseErrors
  };
}
