import fs from 'fs';

const profilePath = 'data/bible/registry/canon-profiles/roman-catholic.draft.json';
const adapterPath = 'js/bible-browser/bible-registry-adapter.js';
const resolverPath = 'js/scripture-resolver.js';

const requiredSamples = [
  {
    identity_id: 'TOBIT',
    source_path: 'data/bible/OT/tobit.json',
    canonical_status: 'deuterocanonical'
  },
  {
    identity_id: 'ESTHER',
    source_path: 'data/bible/OT/estherGK.json',
    canonical_status: 'deuterocanonical'
  },
  {
    identity_id: 'DANIEL',
    source_path: 'data/bible/OT/danielGK.json',
    canonical_status: 'deuterocanonical'
  },
  {
    identity_id: 'SONG_OF_SOLOMON',
    source_path: 'data/bible/OT/songofsolomon.json',
    canonical_status: 'protocanonical'
  },
  {
    identity_id: 'WISDOM',
    source_path: 'data/bible/OT/wisdom.json',
    canonical_status: 'deuterocanonical'
  },
  {
    identity_id: 'SIRACH',
    source_path: 'data/bible/OT/sirach.json',
    canonical_status: 'deuterocanonical'
  },
  {
    identity_id: '1_MACCABEES',
    source_path: 'data/bible/OT/1maccabees.json',
    canonical_status: 'deuterocanonical'
  },
  {
    identity_id: '2_MACCABEES',
    source_path: 'data/bible/OT/2maccabees.json',
    canonical_status: 'deuterocanonical'
  },
  {
    identity_id: 'BARUCH',
    source_path: 'data/bible/OT/baruch.json',
    canonical_status: 'deuterocanonical'
  },
  {
    identity_id: 'LUKE',
    source_path: 'data/bible/NT/luke.json',
    canonical_status: 'protocanonical'
  },
  {
    identity_id: 'REVELATION',
    source_path: 'data/bible/NT/revelation.json',
    canonical_status: 'protocanonical'
  }
];

function fail(failures) {
  console.error(JSON.stringify({
    result: 'FAIL',
    failureCount: failures.length,
    failures: failures.slice(0, 30)
  }, null, 2));
  console.log('ALL FAILED');
  console.log('NEXT: Repair Catholic Bible registry runtime/profile regression before continuing LOTH biblical-reading integration.');
  process.exitCode = 1;
}

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

const failures = [];

for (const file of [profilePath, adapterPath, resolverPath]) {
  if (!fs.existsSync(file)) failures.push(`missing required file: ${file}`);
}

let profile = null;
let entries = [];

if (!failures.length) {
  profile = readJson(profilePath);
  entries = Array.isArray(profile.entries) ? profile.entries : [];

  if (profile.profile_key !== 'roman_catholic') failures.push('Roman Catholic profile key mismatch');
  if (profile.completeness !== 'complete_roman_catholic_canon_profile_entries_73') failures.push('Roman Catholic profile completeness marker mismatch');
  if (entries.length !== 73) failures.push(`expected 73 Roman Catholic entries, found ${entries.length}`);

  const byIdentity = new Map(entries.map(entry => [entry.identity_id, entry]));
  const sourcePaths = new Set();

  for (const entry of entries) {
    if (!entry.source_path || !fs.existsSync(entry.source_path)) failures.push(`${entry.identity_id}: source_path missing or not found`);
    if (sourcePaths.has(entry.source_path)) failures.push(`duplicate profile source_path: ${entry.source_path}`);
    sourcePaths.add(entry.source_path);
    if (entry.use_class !== 'read_in_church') failures.push(`${entry.identity_id}: use_class must be read_in_church`);
    if (entry.ordinary_chapter_verse_resolver_candidate !== true) failures.push(`${entry.identity_id}: must be ordinary chapter/verse resolver candidate`);
  }

  for (const sample of requiredSamples) {
    const entry = byIdentity.get(sample.identity_id);
    if (!entry) {
      failures.push(`missing sample profile entry: ${sample.identity_id}`);
      continue;
    }
    if (entry.source_path !== sample.source_path) failures.push(`${sample.identity_id}: expected source_path ${sample.source_path}, found ${entry.source_path}`);
    if (entry.canonical_status !== sample.canonical_status) failures.push(`${sample.identity_id}: expected canonical_status ${sample.canonical_status}, found ${entry.canonical_status}`);
  }

  const deuterocanonicalCount = entries.filter(entry => entry.canonical_status === 'deuterocanonical').length;
  const protocanonicalCount = entries.filter(entry => entry.canonical_status === 'protocanonical').length;
  if (deuterocanonicalCount !== 9) failures.push(`expected 9 deuterocanonical entries, found ${deuterocanonicalCount}`);
  if (protocanonicalCount !== 64) failures.push(`expected 64 protocanonical entries, found ${protocanonicalCount}`);
}

if (!failures.length) {
  const adapter = fs.readFileSync(adapterPath, 'utf8');
  const resolver = fs.readFileSync(resolverPath, 'utf8');

  const adapterRequiredMarkers = [
    'UniversalOfficeBibleRegistryAdapter',
    'findBookRecord',
    'getRecordsForProfile',
    'getOrdinaryChapterVerseRecords'
  ];

  for (const marker of adapterRequiredMarkers) {
    if (!adapter.includes(marker)) failures.push(`adapter missing marker: ${marker}`);
  }

  const resolverRequiredMarkers = [
    'UniversalOfficeBibleRegistryAdapter',
    'findBookRecord',
    'await _resolveBibleBookSource'
  ];

  for (const marker of resolverRequiredMarkers) {
    if (!resolver.includes(marker)) failures.push(`resolver missing marker: ${marker}`);
  }

  if (!/const\s+folder\s*=\s*NT_BOOKS\.includes/.test(resolver)) {
    failures.push('resolver legacy OT/NT fallback folder assignment marker missing');
  }

  if (!/data\/bible\/\$\{folder\}\/\$\{filename\}/.test(resolver)) {
    failures.push('resolver legacy OT/NT fallback path marker missing');
  }
}

if (failures.length) {
  fail(failures);
} else {
  const sampleSummary = requiredSamples.map(sample => {
    const entry = entries.find(item => item.identity_id === sample.identity_id);
    return {
      identity_id: entry.identity_id,
      source_path: entry.source_path,
      canonical_status: entry.canonical_status
    };
  });

  console.log(JSON.stringify({
    result: 'OK',
    profilePath,
    entryCount: entries.length,
    protocanonicalCount: entries.filter(entry => entry.canonical_status === 'protocanonical').length,
    deuterocanonicalCount: entries.filter(entry => entry.canonical_status === 'deuterocanonical').length,
    sampleCount: sampleSummary.length,
    samples: sampleSummary
  }, null, 2));
  console.log('ALL PASSED');
  console.log('NEXT: Catholic Bible profile/runtime regression is guarded. Continue LOTH biblical-reading integration without duplicating Bible text.');
}
