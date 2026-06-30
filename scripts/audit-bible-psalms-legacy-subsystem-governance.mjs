#!/usr/bin/env node
import fs from 'node:fs';

const governancePath = "data/bible/registry/psalms-legacy-subsystem-governance.json";

const governance = JSON.parse(fs.readFileSync(governancePath, 'utf8'));
const psalms = JSON.parse(fs.readFileSync(governance.psalmsPath, 'utf8'));

const failures = [];

if (typeof governance.schema !== 'string' || !/^psalms-legacy-subsystem-governance-v\d+$/.test(governance.schema)) {
  failures.push({ type: 'schema-mismatch', actual: governance.schema });
}

const allowedGovernanceStatuses = new Set([
  'governed_not_textually_trusted',
  'governed_partial_lane_source_trust',
  'governed_partial_lane_source_trust_with_nabre_blocker',
  'governed_all_expected_lane_source_trust'
]);

if (!allowedGovernanceStatuses.has(governance.status)) {
  failures.push({ type: 'status-mismatch', actual: governance.status, allowed: Array.from(allowedGovernanceStatuses) });
}

if (!Array.isArray(psalms)) {
  failures.push({ type: 'psalms-not-root-array' });
}

if (Array.isArray(psalms) && psalms.length !== governance.expectedShape.recordCount) {
  failures.push({ type: 'record-count-mismatch', expected: governance.expectedShape.recordCount, actual: psalms.length });
}

const counts = {};
const orthodoxIds = [];
const grailExtraIds = [];

if (Array.isArray(psalms)) {
  for (const item of psalms) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      failures.push({ type: 'invalid-record', item });
      continue;
    }

    for (const key of governance.expectedShape.requiredRecordKeys) {
      if (!Object.prototype.hasOwnProperty.call(item, key)) failures.push({ type: 'missing-record-key', key, id: item.id });
    }

    if (typeof item.id !== 'string' || !/^PSALM [0-9]+$/.test(item.id)) {
      failures.push({ type: 'bad-psalm-id', id: item.id });
    }

    const text = item.text && typeof item.text === 'object' && !Array.isArray(item.text) ? item.text : {};
    for (const [translation, value] of Object.entries(text)) {
      if (typeof value === 'string' && value.trim()) {
        counts[translation] = (counts[translation] || 0) + 1;
        if (translation === 'Orthodox') orthodoxIds.push(item.id);
        if (translation === 'Grail1963' && item.id === 'PSALM 151') grailExtraIds.push(item.id);
      }
    }
  }
}

for (const [translation, expected] of Object.entries(governance.expectedTranslationCounts)) {
  const actual = counts[translation] || 0;
  if (actual !== expected) {
    failures.push({ type: 'translation-count-mismatch', translation, expected, actual });
  }
}

const expectedOrthodox = governance.expectedAppendix.orthodoxIds.join('|');
const actualOrthodox = orthodoxIds.join('|');
if (actualOrthodox !== expectedOrthodox) {
  failures.push({ type: 'orthodox-appendix-mismatch', expected: governance.expectedAppendix.orthodoxIds, actual: orthodoxIds });
}

const expectedGrailExtra = governance.expectedAppendix.grailExtraIds.join('|');
const actualGrailExtra = grailExtraIds.join('|');
if (actualGrailExtra !== expectedGrailExtra) {
  failures.push({ type: 'grail-extra-mismatch', expected: governance.expectedAppendix.grailExtraIds, actual: grailExtraIds });
}

const report = {
  audit: 'psalms-legacy-subsystem-governance',
  status: failures.length ? 'failed' : 'passed',
  recordCount: Array.isArray(psalms) ? psalms.length : null,
  translationCounts: counts,
  orthodoxIds,
  grailExtraIds,
  failures
};

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Review Psalms legacy subsystem governance failures.');
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Psalms legacy subsystem governance passed for the current governed source-trust status.');
}
