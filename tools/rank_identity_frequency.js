// tools/rank_identity_frequency.js
// Compute identity frequency from commemorations.json
// Usage: node tools/rank_identity_frequency.js

'use strict';

const fs   = require('fs');
const path = require('path');

const commemorations = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/saints/commemorations.json'), 'utf8')
);
const identities = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/saints/identities.json'), 'utf8')
);

// --- Frequency count (field is identity_id) ---
const freq = {};
for (const c of commemorations) {
  const id = c.identity_id;
  freq[id] = (freq[id] || 0) + 1;
}

// Build identity lookup
const idMap = {};
for (const id of identities) {
  idMap[id.id] = id;
}

// Top 30 by frequency
const sorted = Object.entries(freq)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30);

console.log('\n=== TOP 30 IDENTITIES BY COMMEMORATION COUNT ===\n');
console.log('rank | count | type         | id');
console.log('-----|-------|--------------|----------------------------');
sorted.forEach(([id, count], i) => {
  const identity = idMap[id] || {};
  const type = (identity.type || 'MISSING').padEnd(12);
  console.log(`${String(i+1).padStart(4)} | ${String(count).padStart(5)} | ${type} | ${id}`);
});

// --- Duplicate/near-duplicate detection ---
console.log('\n=== POTENTIAL DUPLICATE / NEAR-DUPLICATE IDs ===\n');

// Normalize id for comparison
function normalizeId(id) {
  return id
    .replace(/^(saint|feast|prophet|apostle|martyr|blessed)-/, '')
    .replace(/-\d+$/, '')
    .toLowerCase();
}

const normMap = {};
for (const id of identities) {
  const norm = normalizeId(id.id);
  if (!normMap[norm]) normMap[norm] = [];
  normMap[norm].push(id.id);
}

const dupes = Object.entries(normMap).filter(([, ids]) => ids.length > 1);
if (dupes.length === 0) {
  console.log('  No obvious duplicates found by slug normalization.');
} else {
  dupes.forEach(([norm, ids]) => {
    console.log(`  Normalized: "${norm}"`);
    ids.forEach(id => console.log(`    - ${id} (type: ${(idMap[id]?.type) || '?'}, comms: ${freq[id] || 0})`));
  });
}

// --- Suspicious types ---
console.log('\n=== IDENTITIES WITH SUSPICIOUS/REVIEW TYPES ===\n');
const reviewTypes = ['unknown', 'UNKNOWN', '', null, undefined];
const suspicious = identities.filter(id => reviewTypes.includes(id.type));
if (suspicious.length === 0) {
  console.log('  No identities with type=unknown or missing type.');
} else {
  suspicious.forEach(id => {
    console.log(`  ${id.id} | type="${id.type}" | name="${id.name}"`);
  });
}

// "commemoration" types
console.log('\n=== "commemoration" TYPED ENTRIES ===\n');
const commType = identities.filter(id => id.type === 'commemoration');
commType.forEach(id => {
  console.log(`  ${id.id} | name="${id.name}" | comms: ${freq[id.id] || 0}`);
});

console.log('\n=== DONE ===\n');