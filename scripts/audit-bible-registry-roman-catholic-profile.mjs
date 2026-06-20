import fs from 'fs';

const profilePath = 'data/bible/registry/canon-profiles/roman-catholic.draft.json';

function fail(message) {
  console.error(JSON.stringify({ result: 'FAIL', message }, null, 2));
  console.log('ALL FAILED');
  console.log('NEXT: Repair Roman Catholic Bible profile entries before continuing Catholic Bible / LOTH resolver work.');
  process.exitCode = 1;
}

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

const expected = [
  {
    "identity_id": "GENESIS",
    "base_work_id": "GENESIS",
    "text_form_id": "GENESIS",
    "preferred_title": "Genesis",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "EXODUS",
    "base_work_id": "EXODUS",
    "text_form_id": "EXODUS",
    "preferred_title": "Exodus",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "LEVITICUS",
    "base_work_id": "LEVITICUS",
    "text_form_id": "LEVITICUS",
    "preferred_title": "Leviticus",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "NUMBERS",
    "base_work_id": "NUMBERS",
    "text_form_id": "NUMBERS",
    "preferred_title": "Numbers",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "DEUTERONOMY",
    "base_work_id": "DEUTERONOMY",
    "text_form_id": "DEUTERONOMY",
    "preferred_title": "Deuteronomy",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "JOSHUA",
    "base_work_id": "JOSHUA",
    "text_form_id": "JOSHUA",
    "preferred_title": "Joshua",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "JUDGES",
    "base_work_id": "JUDGES",
    "text_form_id": "JUDGES",
    "preferred_title": "Judges",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "RUTH",
    "base_work_id": "RUTH",
    "text_form_id": "RUTH",
    "preferred_title": "Ruth",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "1_SAMUEL",
    "base_work_id": "1_SAMUEL",
    "text_form_id": "1_SAMUEL",
    "preferred_title": "1 Samuel",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "2_SAMUEL",
    "base_work_id": "2_SAMUEL",
    "text_form_id": "2_SAMUEL",
    "preferred_title": "2 Samuel",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "1_KINGS",
    "base_work_id": "1_KINGS",
    "text_form_id": "1_KINGS",
    "preferred_title": "1 Kings",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "2_KINGS",
    "base_work_id": "2_KINGS",
    "text_form_id": "2_KINGS",
    "preferred_title": "2 Kings",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "1_CHRONICLES",
    "base_work_id": "1_CHRONICLES",
    "text_form_id": "1_CHRONICLES",
    "preferred_title": "1 Chronicles",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "2_CHRONICLES",
    "base_work_id": "2_CHRONICLES",
    "text_form_id": "2_CHRONICLES",
    "preferred_title": "2 Chronicles",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "EZRA",
    "base_work_id": "EZRA",
    "text_form_id": "EZRA",
    "preferred_title": "Ezra",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "NEHEMIAH",
    "base_work_id": "NEHEMIAH",
    "text_form_id": "NEHEMIAH",
    "preferred_title": "Nehemiah",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "TOBIT",
    "base_work_id": "TOBIT",
    "text_form_id": "TOBIT",
    "preferred_title": "Tobit",
    "canonical_status": "deuterocanonical"
  },
  {
    "identity_id": "JUDITH",
    "base_work_id": "JUDITH",
    "text_form_id": "JUDITH",
    "preferred_title": "Judith",
    "canonical_status": "deuterocanonical"
  },
  {
    "identity_id": "ESTHER",
    "base_work_id": "ESTHER",
    "text_form_id": "ESTHER_GREEK_WITH_ADDITIONS",
    "preferred_title": "Esther, Greek / With Additions",
    "canonical_status": "deuterocanonical"
  },
  {
    "identity_id": "1_MACCABEES",
    "base_work_id": "1_MACCABEES",
    "text_form_id": "1_MACCABEES",
    "preferred_title": "1 Maccabees",
    "canonical_status": "deuterocanonical"
  },
  {
    "identity_id": "2_MACCABEES",
    "base_work_id": "2_MACCABEES",
    "text_form_id": "2_MACCABEES",
    "preferred_title": "2 Maccabees",
    "canonical_status": "deuterocanonical"
  },
  {
    "identity_id": "JOB",
    "base_work_id": "JOB",
    "text_form_id": "JOB",
    "preferred_title": "Job",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "PSALMS",
    "base_work_id": "PSALMS",
    "text_form_id": "PSALMS",
    "preferred_title": "Psalms",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "PROVERBS",
    "base_work_id": "PROVERBS",
    "text_form_id": "PROVERBS",
    "preferred_title": "Proverbs",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "ECCLESIASTES",
    "base_work_id": "ECCLESIASTES",
    "text_form_id": "ECCLESIASTES",
    "preferred_title": "Ecclesiastes",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "SONG_OF_SOLOMON",
    "base_work_id": "SONG_OF_SOLOMON",
    "text_form_id": "SONG_OF_SOLOMON",
    "preferred_title": "Song of Solomon / Song of Songs",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "WISDOM",
    "base_work_id": "WISDOM",
    "text_form_id": "WISDOM",
    "preferred_title": "Wisdom of Solomon",
    "canonical_status": "deuterocanonical"
  },
  {
    "identity_id": "SIRACH",
    "base_work_id": "SIRACH",
    "text_form_id": "SIRACH",
    "preferred_title": "Sirach / Ecclesiasticus",
    "canonical_status": "deuterocanonical"
  },
  {
    "identity_id": "ISAIAH",
    "base_work_id": "ISAIAH",
    "text_form_id": "ISAIAH",
    "preferred_title": "Isaiah",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "JEREMIAH",
    "base_work_id": "JEREMIAH",
    "text_form_id": "JEREMIAH",
    "preferred_title": "Jeremiah",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "LAMENTATIONS",
    "base_work_id": "LAMENTATIONS",
    "text_form_id": "LAMENTATIONS",
    "preferred_title": "Lamentations",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "BARUCH",
    "base_work_id": "BARUCH",
    "text_form_id": "BARUCH",
    "preferred_title": "Baruch",
    "canonical_status": "deuterocanonical"
  },
  {
    "identity_id": "EZEKIEL",
    "base_work_id": "EZEKIEL",
    "text_form_id": "EZEKIEL",
    "preferred_title": "Ezekiel",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "DANIEL",
    "base_work_id": "DANIEL",
    "text_form_id": "DANIEL_GREEK_EXTENDED",
    "preferred_title": "Daniel, Greek / Extended Form",
    "canonical_status": "deuterocanonical"
  },
  {
    "identity_id": "HOSEA",
    "base_work_id": "HOSEA",
    "text_form_id": "HOSEA",
    "preferred_title": "Hosea",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "JOEL",
    "base_work_id": "JOEL",
    "text_form_id": "JOEL",
    "preferred_title": "Joel",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "AMOS",
    "base_work_id": "AMOS",
    "text_form_id": "AMOS",
    "preferred_title": "Amos",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "OBADIAH",
    "base_work_id": "OBADIAH",
    "text_form_id": "OBADIAH",
    "preferred_title": "Obadiah",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "JONAH",
    "base_work_id": "JONAH",
    "text_form_id": "JONAH",
    "preferred_title": "Jonah",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "MICAH",
    "base_work_id": "MICAH",
    "text_form_id": "MICAH",
    "preferred_title": "Micah",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "NAHUM",
    "base_work_id": "NAHUM",
    "text_form_id": "NAHUM",
    "preferred_title": "Nahum",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "HABAKKUK",
    "base_work_id": "HABAKKUK",
    "text_form_id": "HABAKKUK",
    "preferred_title": "Habakkuk",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "ZEPHANIAH",
    "base_work_id": "ZEPHANIAH",
    "text_form_id": "ZEPHANIAH",
    "preferred_title": "Zephaniah",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "HAGGAI",
    "base_work_id": "HAGGAI",
    "text_form_id": "HAGGAI",
    "preferred_title": "Haggai",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "ZECHARIAH",
    "base_work_id": "ZECHARIAH",
    "text_form_id": "ZECHARIAH",
    "preferred_title": "Zechariah",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "MALACHI",
    "base_work_id": "MALACHI",
    "text_form_id": "MALACHI",
    "preferred_title": "Malachi",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "MATTHEW",
    "base_work_id": "MATTHEW",
    "text_form_id": "MATTHEW",
    "preferred_title": "Matthew",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "MARK",
    "base_work_id": "MARK",
    "text_form_id": "MARK",
    "preferred_title": "Mark",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "LUKE",
    "base_work_id": "LUKE",
    "text_form_id": "LUKE",
    "preferred_title": "Luke",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "JOHN",
    "base_work_id": "JOHN",
    "text_form_id": "JOHN",
    "preferred_title": "John",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "ACTS",
    "base_work_id": "ACTS",
    "text_form_id": "ACTS",
    "preferred_title": "Acts",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "ROMANS",
    "base_work_id": "ROMANS",
    "text_form_id": "ROMANS",
    "preferred_title": "Romans",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "1_CORINTHIANS",
    "base_work_id": "1_CORINTHIANS",
    "text_form_id": "1_CORINTHIANS",
    "preferred_title": "1 Corinthians",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "2_CORINTHIANS",
    "base_work_id": "2_CORINTHIANS",
    "text_form_id": "2_CORINTHIANS",
    "preferred_title": "2 Corinthians",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "GALATIANS",
    "base_work_id": "GALATIANS",
    "text_form_id": "GALATIANS",
    "preferred_title": "Galatians",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "EPHESIANS",
    "base_work_id": "EPHESIANS",
    "text_form_id": "EPHESIANS",
    "preferred_title": "Ephesians",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "PHILIPPIANS",
    "base_work_id": "PHILIPPIANS",
    "text_form_id": "PHILIPPIANS",
    "preferred_title": "Philippians",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "COLOSSIANS",
    "base_work_id": "COLOSSIANS",
    "text_form_id": "COLOSSIANS",
    "preferred_title": "Colossians",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "1_THESSALONIANS",
    "base_work_id": "1_THESSALONIANS",
    "text_form_id": "1_THESSALONIANS",
    "preferred_title": "1 Thessalonians",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "2_THESSALONIANS",
    "base_work_id": "2_THESSALONIANS",
    "text_form_id": "2_THESSALONIANS",
    "preferred_title": "2 Thessalonians",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "1_TIMOTHY",
    "base_work_id": "1_TIMOTHY",
    "text_form_id": "1_TIMOTHY",
    "preferred_title": "1 Timothy",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "2_TIMOTHY",
    "base_work_id": "2_TIMOTHY",
    "text_form_id": "2_TIMOTHY",
    "preferred_title": "2 Timothy",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "TITUS",
    "base_work_id": "TITUS",
    "text_form_id": "TITUS",
    "preferred_title": "Titus",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "PHILEMON",
    "base_work_id": "PHILEMON",
    "text_form_id": "PHILEMON",
    "preferred_title": "Philemon",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "HEBREWS",
    "base_work_id": "HEBREWS",
    "text_form_id": "HEBREWS",
    "preferred_title": "Hebrews",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "JAMES",
    "base_work_id": "JAMES",
    "text_form_id": "JAMES",
    "preferred_title": "James",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "1_PETER",
    "base_work_id": "1_PETER",
    "text_form_id": "1_PETER",
    "preferred_title": "1 Peter",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "2_PETER",
    "base_work_id": "2_PETER",
    "text_form_id": "2_PETER",
    "preferred_title": "2 Peter",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "1_JOHN",
    "base_work_id": "1_JOHN",
    "text_form_id": "1_JOHN",
    "preferred_title": "1 John",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "2_JOHN",
    "base_work_id": "2_JOHN",
    "text_form_id": "2_JOHN",
    "preferred_title": "2 John",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "3_JOHN",
    "base_work_id": "3_JOHN",
    "text_form_id": "3_JOHN",
    "preferred_title": "3 John",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "JUDE",
    "base_work_id": "JUDE",
    "text_form_id": "JUDE",
    "preferred_title": "Jude",
    "canonical_status": "protocanonical"
  },
  {
    "identity_id": "REVELATION",
    "base_work_id": "REVELATION",
    "text_form_id": "REVELATION",
    "preferred_title": "Revelation",
    "canonical_status": "protocanonical"
  }
];

if (!fs.existsSync(profilePath)) fail('Roman Catholic profile file is missing.');

const profile = readJson(profilePath);
const entries = Array.isArray(profile.entries) ? profile.entries : [];

const failures = [];

if (profile.profile_key !== 'roman_catholic') failures.push('profile_key must be roman_catholic');
if (profile.completeness !== 'complete_roman_catholic_canon_profile_entries_73') failures.push('profile completeness marker is not current');
if (entries.length !== 73) failures.push(`expected 73 Roman Catholic profile entries, found ${entries.length}`);

const byIdentity = new Map(entries.map(entry => [entry.identity_id, entry]));
const sourcePaths = new Set();

for (const expectedEntry of expected) {
  const entry = byIdentity.get(expectedEntry.identity_id);
  if (!entry) {
    failures.push(`missing entry ${expectedEntry.identity_id}`);
    continue;
  }

  for (const key of ['base_work_id', 'text_form_id', 'preferred_title', 'canonical_status']) {
    if (entry[key] !== expectedEntry[key]) failures.push(`${expectedEntry.identity_id}: ${key} mismatch`);
  }

  if (entry.use_class !== 'read_in_church') failures.push(`${expectedEntry.identity_id}: use_class must be read_in_church`);
  if (entry.ordinary_chapter_verse_resolver_candidate !== true) failures.push(`${expectedEntry.identity_id}: must be ordinary chapter/verse resolver candidate`);
  if (!entry.source_path || !fs.existsSync(entry.source_path)) failures.push(`${expectedEntry.identity_id}: source_path missing or file not found`);

  if (sourcePaths.has(entry.source_path)) failures.push(`duplicate source_path: ${entry.source_path}`);
  sourcePaths.add(entry.source_path);
}

const deuterocanonicalCount = entries.filter(entry => entry.canonical_status === 'deuterocanonical').length;
const protocanonicalCount = entries.filter(entry => entry.canonical_status === 'protocanonical').length;

if (deuterocanonicalCount !== 9) failures.push(`expected 9 deuterocanonical entries, found ${deuterocanonicalCount}`);
if (protocanonicalCount !== 64) failures.push(`expected 64 protocanonical entries, found ${protocanonicalCount}`);

const song = byIdentity.get('SONG_OF_SOLOMON');
if (!song || song.source_path !== 'data/bible/OT/songofsolomon.json') {
  failures.push('SONG_OF_SOLOMON must resolve to data/bible/OT/songofsolomon.json');
}

if (failures.length) {
  console.error(JSON.stringify({ result: 'FAIL', failureCount: failures.length, failures: failures.slice(0, 20) }, null, 2));
  console.log('ALL FAILED');
  console.log('NEXT: Repair Roman Catholic Bible profile entries before continuing Catholic Bible / LOTH resolver work.');
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({
    result: 'OK',
    profilePath,
    entryCount: entries.length,
    protocanonicalCount,
    deuterocanonicalCount,
    songOfSolomonPath: song.source_path
  }, null, 2));
  console.log('ALL PASSED');
  console.log('NEXT: Continue Catholic Bible runtime/profile regression work.');
}
