import fs from 'fs';

const expectedProfiles = [
  {
    "profile_key": "armenian_apostolic_witness",
    "path": "data/bible/registry/canon-profiles/armenian-apostolic-witness.draft.json",
    "status": "draft_complete_profile",
    "completeness": "complete_armenian_apostolic_witness_profile_entries_3",
    "entry_count": 3,
    "identity_ids": [
      "THIRD_CORINTHIANS",
      "ARMENIAN_CANTICLES",
      "PRAYER_OF_APOLLONIUS"
    ],
    "canonical_status_counts": {
      "appendix": 1,
      "liturgical_reading": 1,
      "witness_only": 1
    },
    "use_class_counts": {
      "study_only": 2,
      "read_in_church": 1
    }
  },
  {
    "profile_key": "coptic_orthodox_liturgical",
    "path": "data/bible/registry/canon-profiles/coptic-orthodox-liturgical.draft.json",
    "status": "draft_complete_profile",
    "completeness": "complete_coptic_orthodox_liturgical_profile_entries_1",
    "entry_count": 1,
    "identity_ids": [
      "COPTIC_ODES"
    ],
    "canonical_status_counts": {
      "liturgical_reading": 1
    },
    "use_class_counts": {
      "read_in_church": 1
    }
  },
  {
    "profile_key": "eastern_orthodox",
    "path": "data/bible/registry/canon-profiles/eastern-orthodox.draft.json",
    "status": "draft_complete_profile",
    "completeness": "complete_eastern_orthodox_profile_entries_3",
    "entry_count": 3,
    "identity_ids": [
      "DANIEL",
      "ESTHER",
      "EASTERN_ORTHODOX_NINE_ODES"
    ],
    "canonical_status_counts": {
      "anagignoskomena": 2,
      "liturgical_reading": 1
    },
    "use_class_counts": {
      "read_in_church": 3
    }
  },
  {
    "profile_key": "ethiopian_orthodox_broader",
    "path": "data/bible/registry/canon-profiles/ethiopian-orthodox-broader.draft.json",
    "status": "draft_complete_profile",
    "completeness": "complete_ethiopian_orthodox_broader_profile_entries_34",
    "entry_count": 34,
    "identity_ids": [
      "FIRST_ENOCH",
      "FIRST_MEQABYAN",
      "SECOND_MEQABYAN",
      "THIRD_MEQABYAN",
      "ABTILIS",
      "ETHIOPIAN_ODES",
      "FETHA_NAGAST",
      "GITSIW_ADMONITIONS",
      "GUBAE_KANA",
      "JOSIPPON",
      "JUBILEES",
      "MALKEA_GUBAE",
      "MALKEA_IYASUS",
      "MALKEA_MARIAM",
      "MAZAHETA",
      "QALEMENTOS_BOOK_OF_ROLLS",
      "QALEMENTOS_BOOK_1",
      "QALEMENTOS_BOOK_2",
      "QALEMENTOS_BOOK_3",
      "QALEMENTOS_BOOK_4",
      "QALEMENTOS_BOOK_5",
      "QALEMENTOS_BOOK_6",
      "QALEMENTOS_BOOK_7",
      "QALEMENTOS_BOOK_8",
      "QALEMENTOS_STATUTES",
      "QALEMENTOS_VISIONARY_REVELATION",
      "SIRATE_TSION",
      "MIRACLES_OF_MARY",
      "ASCENSION_OF_ISAIAH",
      "ETHIOPIC_DIDASKALIA",
      "REST_OF_BARUCH",
      "REST_OF_JEREMIAH",
      "SHEPHERD_OF_HERMAS",
      "TIZAZ"
    ],
    "canonical_status_counts": {
      "broader_canon": 25,
      "liturgical_reading": 7,
      "witness_only": 2
    },
    "use_class_counts": {
      "read_in_church": 6,
      "study_only": 23,
      "read_devotionally": 5
    }
  },
  {
    "profile_key": "study_witness",
    "path": "data/bible/registry/canon-profiles/study-witness.draft.json",
    "status": "draft_complete_profile",
    "completeness": "complete_study_witness_profile_entries_35",
    "entry_count": 35,
    "identity_ids": [
      "FIRST_ENOCH",
      "FIRST_MEQABYAN",
      "SECOND_BARUCH",
      "SECOND_MEQABYAN",
      "THIRD_CORINTHIANS",
      "THIRD_MEQABYAN",
      "ABTILIS",
      "DANIEL",
      "ESTHER",
      "FETHA_NAGAST",
      "GITSIW_ADMONITIONS",
      "GUBAE_KANA",
      "JUBILEES",
      "QALEMENTOS_BOOK_OF_ROLLS",
      "QALEMENTOS_BOOK_1",
      "QALEMENTOS_BOOK_2",
      "QALEMENTOS_BOOK_3",
      "QALEMENTOS_BOOK_4",
      "QALEMENTOS_BOOK_5",
      "QALEMENTOS_BOOK_6",
      "QALEMENTOS_BOOK_7",
      "QALEMENTOS_BOOK_8",
      "QALEMENTOS_STATUTES",
      "QALEMENTOS_VISIONARY_REVELATION",
      "SIRATE_TSION",
      "ASCENSION_OF_ISAIAH",
      "ETHIOPIC_DIDASKALIA",
      "HISTORY_OF_ZOSIMUS",
      "LETTER_OF_BARUCH_SYRIAC",
      "ODES_OF_SOLOMON",
      "PRAYER_OF_APOLLONIUS",
      "REST_OF_BARUCH",
      "REST_OF_JEREMIAH",
      "SHEPHERD_OF_HERMAS",
      "TIZAZ"
    ],
    "canonical_status_counts": {
      "witness_only": 35
    },
    "use_class_counts": {
      "study_only": 35
    }
  },
  {
    "profile_key": "syriac_christian_witness",
    "path": "data/bible/registry/canon-profiles/syriac-christian-witness.draft.json",
    "status": "draft_complete_profile",
    "completeness": "complete_syriac_christian_witness_profile_entries_2",
    "entry_count": 2,
    "identity_ids": [
      "LETTER_OF_BARUCH_SYRIAC",
      "ODES_OF_SOLOMON"
    ],
    "canonical_status_counts": {
      "witness_only": 2
    },
    "use_class_counts": {
      "study_only": 2
    }
  }
];

const allowedStatuses = new Set(["protocanonical","deuterocanonical","anagignoskomena","antilegomena","broader_canon","appendix","liturgical_reading","witness_only","excluded"]);
const allowedUseClasses = new Set(["read_in_church","read_devotionally","study_only","not_in_profile"]);

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function countBy(entries, key) {
  const counts = {};
  for (const entry of entries) {
    counts[entry[key]] = (counts[entry[key]] || 0) + 1;
  }
  return counts;
}

function sameJson(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const failures = [];

for (const expected of expectedProfiles) {
  if (!fs.existsSync(expected.path)) {
    failures.push(`${expected.profile_key}: profile file missing`);
    continue;
  }

  const profile = readJson(expected.path);
  const entries = Array.isArray(profile.entries) ? profile.entries : [];

  if (profile.profile_key !== expected.profile_key) failures.push(`${expected.profile_key}: profile_key mismatch`);
  if (profile.status !== expected.status) failures.push(`${expected.profile_key}: status mismatch`);
  if (profile.completeness !== expected.completeness) failures.push(`${expected.profile_key}: completeness mismatch`);
  if (entries.length !== expected.entry_count) failures.push(`${expected.profile_key}: expected ${expected.entry_count} entries, found ${entries.length}`);

  const identityIds = entries.map(entry => entry.identity_id);
  if (!sameJson(identityIds, expected.identity_ids)) failures.push(`${expected.profile_key}: identity order/set mismatch`);

  const canonicalStatusCounts = countBy(entries, 'canonical_status');
  const useClassCounts = countBy(entries, 'use_class');

  if (!sameJson(canonicalStatusCounts, expected.canonical_status_counts)) failures.push(`${expected.profile_key}: canonical status counts mismatch`);
  if (!sameJson(useClassCounts, expected.use_class_counts)) failures.push(`${expected.profile_key}: use class counts mismatch`);

  const seenPaths = new Set();

  for (const entry of entries) {
    for (const field of ['identity_id', 'base_work_id', 'text_form_id', 'source_path', 'preferred_title', 'work_type', 'canonical_status', 'use_class']) {
      if (entry[field] === undefined || entry[field] === null || entry[field] === '') failures.push(`${expected.profile_key}/${entry.identity_id || 'UNKNOWN'} missing ${field}`);
    }

    if (!allowedStatuses.has(entry.canonical_status)) failures.push(`${expected.profile_key}/${entry.identity_id}: invalid canonical_status ${entry.canonical_status}`);
    if (!allowedUseClasses.has(entry.use_class)) failures.push(`${expected.profile_key}/${entry.identity_id}: invalid use_class ${entry.use_class}`);
    if (!entry.source_path || !fs.existsSync(entry.source_path)) failures.push(`${expected.profile_key}/${entry.identity_id}: source_path missing or not found`);

    if (seenPaths.has(entry.source_path)) failures.push(`${expected.profile_key}: duplicate source_path ${entry.source_path}`);
    seenPaths.add(entry.source_path);
  }
}

if (failures.length) {
  console.error(JSON.stringify({ result: 'FAIL', failureCount: failures.length, failures: failures.slice(0, 40) }, null, 2));
  console.log('ALL FAILED');
  console.log('NEXT: Repair non-Roman Bible tradition profiles before LOTH biblical-reading integration.');
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({
    result: 'OK',
    profileCount: expectedProfiles.length,
    profiles: expectedProfiles.map(profile => ({
      profile_key: profile.profile_key,
      entry_count: profile.entry_count,
      completeness: profile.completeness,
      canonical_status_counts: profile.canonical_status_counts,
      use_class_counts: profile.use_class_counts
    }))
  }, null, 2));
  console.log('ALL PASSED');
  console.log('NEXT: Non-Roman Bible tradition profiles are guarded. Continue tradition-profile runtime regression or LOTH biblical-reading integration.');
}
