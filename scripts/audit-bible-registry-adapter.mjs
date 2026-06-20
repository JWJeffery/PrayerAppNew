import fs from 'fs';

const reportPath = process.env.BIBLE_REGISTRY_ADAPTER_AUDIT_REPORT || '/tmp/bible-registry-adapter-audit.json';
const failures = [];

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
}

function fail(message) {
  failures.push(message);
}

const adapterPath = 'js/bible-browser/bible-registry-adapter.js';
const indexPath = 'index.html';
const packagePath = 'package.json';

const adapter = fs.existsSync(adapterPath) ? read(adapterPath) : '';
const index = fs.existsSync(indexPath) ? read(indexPath) : '';
const pkg = readJson(packagePath);
const manifest = readJson('data/bible/registry/file-manifest.json');
const adjudications = readJson('data/bible/registry/identity-adjudications.json');
const profileIndex = readJson('data/bible/registry/canon-profiles/index.draft.json');

if (!adapter.includes('window.UniversalOfficeBibleRegistryAdapter')) {
  fail('Registry adapter does not expose window.UniversalOfficeBibleRegistryAdapter.');
}

for (const token of [
  'file-manifest.json',
  'identity-adjudications.json',
  'book-identities.draft.json',
  'canon-profiles/index.draft.json',
  'canon-status-vocabulary.json',
  'getOrdinaryChapterVerseRecords',
  'findBookRecord',
  'getRecordsForProfile',
  'ordinaryChapterVerseResolverCandidate',
  'profileHints',
  'adapterRequired'
]) {
  if (!adapter.includes(token)) {
    fail(`Registry adapter is missing expected token: ${token}`);
  }
}

const adapterTag = '<script src="js/bible-browser/bible-registry-adapter.js" defer></script>';
const parserTag = '<script src="js/bible-browser/reference-parser.js" defer></script>';

if (!index.includes(adapterTag)) {
  fail('index.html does not load the Bible registry adapter.');
}

if (index.includes(adapterTag) && index.includes(parserTag) && index.indexOf(adapterTag) > index.indexOf(parserTag)) {
  fail('Bible registry adapter must load before reference-parser.js.');
}

if (pkg.scripts && pkg.scripts['audit:bible-registry-adapter'] !== 'node scripts/audit-bible-registry-adapter.mjs') {
  fail('package.json has an unexpected audit:bible-registry-adapter value.');
}

const adjudicated = new Set((adjudications.adjudications || []).map(row => row.source_path));
const outside = (manifest.files || []).filter(row => row.resolver_status === 'not_routed_by_legacy_resolver');
const unadjudicatedOutside = outside.filter(row => !adjudicated.has(row.path));

if ((manifest.files || []).length !== 125) {
  fail(`Expected 125 Bible manifest files, got ${(manifest.files || []).length}.`);
}

if ((adjudications.adjudications || []).length < 45) {
  fail(`Expected at least 45 identity adjudications, got ${(adjudications.adjudications || []).length}.`);
}

if (outside.length !== 40) {
  fail(`Expected 40 outside-legacy-resolver files, got ${outside.length}.`);
}

if (unadjudicatedOutside.length) {
  fail(`Expected zero unadjudicated outside-route files, got ${unadjudicatedOutside.length}.`);
}

if (!Array.isArray(profileIndex.profiles) || profileIndex.profiles.length < 7) {
  fail('Canon profile index should expose at least seven draft profiles.');
}

const report = {
  result: failures.length ? 'FAIL' : 'OK',
  failureCount: failures.length,
  failures,
  manifestFileCount: (manifest.files || []).length,
  identityAdjudicationCount: (adjudications.adjudications || []).length,
  outsideLegacyResolverCount: outside.length,
  profileCount: Array.isArray(profileIndex.profiles) ? profileIndex.profiles.length : 0,
  reportPath
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({
  result: report.result,
  failureCount: report.failureCount,
  manifestFileCount: report.manifestFileCount,
  identityAdjudicationCount: report.identityAdjudicationCount,
  outsideLegacyResolverCount: report.outsideLegacyResolverCount,
  profileCount: report.profileCount,
  reportPath
}, null, 2));
console.log(failures.length ? 'ALL FAILED' : 'ALL PASSED');
console.log(failures.length ? `NEXT: inspect ${reportPath}` : 'NEXT: commit registry adapter seam or wire parser integration.');
