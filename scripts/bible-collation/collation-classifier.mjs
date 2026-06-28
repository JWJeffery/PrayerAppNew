export function classifyCell(cell, registry) {
  if (cell.blank) return { classification: 'blank_text', unresolvedKey: `blank_text:${cell.lane}` };
  if (cell.placeholder) return { classification: 'placeholder_text', unresolvedKey: `placeholder_text:${cell.lane}` };
  if (!registry.isRegistered(cell.lane)) {
    return { classification: 'unregistered_source', unresolvedKey: `unregistered_source:${cell.lane}` };
  }
  return { classification: 'registered_text', unresolvedKey: null };
}

export function classifyInventory(inventory, registry) {
  const records = [];
  const classificationCounts = new Map();
  const unresolvedCounts = new Map();

  for (const cell of inventory.cells) {
    const result = classifyCell(cell, registry);
    const record = { ...cell, classification: result.classification };
    records.push(record);
    classificationCounts.set(result.classification, (classificationCounts.get(result.classification) || 0) + 1);
    if (result.unresolvedKey) unresolvedCounts.set(result.unresolvedKey, (unresolvedCounts.get(result.unresolvedKey) || 0) + 1);
  }

  return { records, classificationCounts, unresolvedCounts };
}
