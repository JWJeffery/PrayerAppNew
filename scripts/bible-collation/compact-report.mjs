function objectFromCounts(counts) {
  return Object.fromEntries([...counts.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

function topCounts(counts, limit = 12) {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([classification, count]) => ({ class: classification, count }));
}

export function buildCompactReport({ inventory, classified, registry }) {
  return {
    phase: 'inventory_scaffold',
    trustAssertionsMade: false,
    bibleTextMutated: false,
    sourceCollationPerformed: false,
    registeredTextMeaning: registry.registeredTextMeaning || 'Known registry lane/source label only; not source-verified and not trusted by this report.',
    totalActiveFilesScanned: inventory.filesScanned,
    totalActiveCellsScanned: inventory.cells.length,
    classificationCounts: objectFromCounts(classified.classificationCounts),
    topUnresolvedClasses: topCounts(classified.unresolvedCounts),
    parseErrors: inventory.parseErrors
  };
}
