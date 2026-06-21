import fs from 'node:fs';
import path from 'node:path';

const reportPath = process.env.CATHOLIC_CORPUS_ADDRESSABILITY_REPORT || '/tmp/bible-catholic-corpus-addressability-audit.json';

const targets = [
  {
    "identity_id": "GENESIS",
    "chapter": 1,
    "verse": 1,
    "mode": "chapter_verse"
  },
  {
    "identity_id": "ISAIAH",
    "chapter": 7,
    "verse": 14,
    "mode": "chapter_verse"
  },
  {
    "identity_id": "TOBIT",
    "chapter": 1,
    "verse": 1,
    "mode": "chapter_verse"
  },
  {
    "identity_id": "JUDITH",
    "chapter": 1,
    "verse": 1,
    "mode": "chapter_verse"
  },
  {
    "identity_id": "WISDOM",
    "chapter": 1,
    "verse": 1,
    "mode": "chapter_verse"
  },
  {
    "identity_id": "SIRACH",
    "chapter": 1,
    "verse": 1,
    "mode": "chapter_verse"
  },
  {
    "identity_id": "BARUCH",
    "chapter": 1,
    "verse": 1,
    "mode": "chapter_verse"
  },
  {
    "identity_id": "1_MACCABEES",
    "chapter": 1,
    "verse": 1,
    "mode": "chapter_verse"
  },
  {
    "identity_id": "2_MACCABEES",
    "chapter": 1,
    "verse": 1,
    "mode": "chapter_verse"
  },
  {
    "identity_id": "ESTHER",
    "chapter": 1,
    "verse": 1,
    "mode": "chapter_verse"
  },
  {
    "identity_id": "DANIEL",
    "chapter": 3,
    "verse": 24,
    "mode": "chapter_verse"
  },
  {
    "identity_id": "MATTHEW",
    "chapter": 1,
    "verse": 1,
    "mode": "chapter_verse"
  },
  {
    "identity_id": "LUKE",
    "chapter": 1,
    "verse": 1,
    "mode": "chapter_verse"
  },
  {
    "identity_id": "REVELATION",
    "chapter": 1,
    "verse": 1,
    "mode": "chapter_verse"
  }
];

const directIdentityPaths = {
  GENESIS: 'data/bible/OT/genesis.json',
  EXODUS: 'data/bible/OT/exodus.json',
  LEVITICUS: 'data/bible/OT/leviticus.json',
  NUMBERS: 'data/bible/OT/numbers.json',
  DEUTERONOMY: 'data/bible/OT/deuteronomy.json',
  JOSHUA: 'data/bible/OT/joshua.json',
  JUDGES: 'data/bible/OT/judges.json',
  RUTH: 'data/bible/OT/ruth.json',
  '1_SAMUEL': 'data/bible/OT/1samuel.json',
  '2_SAMUEL': 'data/bible/OT/2samuel.json',
  '1_KINGS': 'data/bible/OT/1kings.json',
  '2_KINGS': 'data/bible/OT/2kings.json',
  '1_CHRONICLES': 'data/bible/OT/1chronicles.json',
  '2_CHRONICLES': 'data/bible/OT/2chronicles.json',
  EZRA: 'data/bible/OT/ezra.json',
  NEHEMIAH: 'data/bible/OT/nehemiah.json',
  TOBIT: 'data/bible/OT/tobit.json',
  JUDITH: 'data/bible/OT/judith.json',
  ESTHER: 'data/bible/OT/esther.json',
  ESTHER_GK: 'data/bible/OT/estherGK.json',
  JOB: 'data/bible/OT/job.json',
  PSALMS: 'data/bible/OT/psalms.json',
  PROVERBS: 'data/bible/OT/proverbs.json',
  ECCLESIASTES: 'data/bible/OT/ecclesiastes.json',
  SONG_OF_SOLOMON: 'data/bible/OT/songofsolomon.json',
  WISDOM: 'data/bible/OT/wisdom.json',
  SIRACH: 'data/bible/OT/sirach.json',
  ECCLESIASTICUS: 'data/bible/OT/sirach.json',
  ISAIAH: 'data/bible/OT/isaiah.json',
  JEREMIAH: 'data/bible/OT/jeremiah.json',
  LAMENTATIONS: 'data/bible/OT/lamentations.json',
  BARUCH: 'data/bible/OT/baruch.json',
  LETTER_OF_JEREMIAH: 'data/bible/OT/letterofjeremiah.json',
  EZEKIEL: 'data/bible/OT/ezekiel.json',
  DANIEL: 'data/bible/OT/daniel.json',
  DANIEL_GK: 'data/bible/OT/danielGK.json',
  HOSEA: 'data/bible/OT/hosea.json',
  JOEL: 'data/bible/OT/joel.json',
  AMOS: 'data/bible/OT/amos.json',
  OBADIAH: 'data/bible/OT/obadiah.json',
  JONAH: 'data/bible/OT/jonah.json',
  MICAH: 'data/bible/OT/micah.json',
  NAHUM: 'data/bible/OT/nahum.json',
  HABAKKUK: 'data/bible/OT/habakkuk.json',
  ZEPHANIAH: 'data/bible/OT/zephaniah.json',
  HAGGAI: 'data/bible/OT/haggai.json',
  ZECHARIAH: 'data/bible/OT/zechariah.json',
  MALACHI: 'data/bible/OT/malachi.json',
  '1_MACCABEES': 'data/bible/OT/1maccabees.json',
  '2_MACCABEES': 'data/bible/OT/2maccabees.json',
  '3_MACCABEES': 'data/bible/OT/3maccabees.json',
  '4_MACCABEES': 'data/bible/OT/4maccabees.json',
  MATTHEW: 'data/bible/NT/matthew.json',
  MARK: 'data/bible/NT/mark.json',
  LUKE: 'data/bible/NT/luke.json',
  JOHN: 'data/bible/NT/john.json',
  ACTS: 'data/bible/NT/acts.json',
  ROMANS: 'data/bible/NT/romans.json',
  '1_CORINTHIANS': 'data/bible/NT/1corinthians.json',
  '2_CORINTHIANS': 'data/bible/NT/2corinthians.json',
  GALATIANS: 'data/bible/NT/galatians.json',
  EPHESIANS: 'data/bible/NT/ephesians.json',
  PHILIPPIANS: 'data/bible/NT/philippians.json',
  COLOSSIANS: 'data/bible/NT/colossians.json',
  '1_THESSALONIANS': 'data/bible/NT/1thessalonians.json',
  '2_THESSALONIANS': 'data/bible/NT/2thessalonians.json',
  '1_TIMOTHY': 'data/bible/NT/1timothy.json',
  '2_TIMOTHY': 'data/bible/NT/2timothy.json',
  TITUS: 'data/bible/NT/titus.json',
  PHILEMON: 'data/bible/NT/philemon.json',
  HEBREWS: 'data/bible/NT/hebrews.json',
  JAMES: 'data/bible/NT/james.json',
  '1_PETER': 'data/bible/NT/1peter.json',
  '2_PETER': 'data/bible/NT/2peter.json',
  '1_JOHN': 'data/bible/NT/1john.json',
  '2_JOHN': 'data/bible/NT/2john.json',
  '3_JOHN': 'data/bible/NT/3john.json',
  JUDE: 'data/bible/NT/jude.json',
  REVELATION: 'data/bible/NT/revelation.json'
};

function intValue(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const match = value.match(/\d+/);
    if (match) return Number(match[0]);
  }
  return null;
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/(?:^|_)of(?:_|$)/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function candidatePathForIdentity(identityId) {
  const direct = directIdentityPaths[identityId];
  if (direct && fs.existsSync(path.join(process.cwd(), direct))) return direct;

  const wanted = normalize(identityId);
  const roots = ['data/bible/OT', 'data/bible/NT', 'data/bible/ET', 'data/bible/SY'];
  for (const root of roots) {
    const abs = path.join(process.cwd(), root);
    if (!fs.existsSync(abs)) continue;
    for (const name of fs.readdirSync(abs)) {
      if (!name.endsWith('.json')) continue;
      const stem = name.replace(/\.json$/, '');
      if (normalize(stem) === wanted) return path.join(root, name);
    }
  }
  return direct || null;
}

function getChapter(data, chapterNumber) {
  const chapters = data?.chapters;
  if (Array.isArray(chapters)) {
    const explicit = chapters.find((chapter) => {
      if (!chapter || typeof chapter !== 'object') return false;
      return ['chapter', 'chapterNumber', 'chapter_number', 'number', 'id'].some((key) => intValue(chapter[key]) === chapterNumber);
    });
    if (explicit) return explicit;
    return chapters[chapterNumber - 1] || null;
  }
  if (chapters && typeof chapters === 'object') {
    return chapters[String(chapterNumber)] || chapters[chapterNumber] || null;
  }
  return null;
}

function getVerse(chapter, verseNumber) {
  const verses = chapter?.verses;
  if (Array.isArray(verses)) {
    const explicit = verses.find((verse) => {
      if (!verse || typeof verse !== 'object') return false;
      return ['verse', 'verseNumber', 'verse_number', 'number', 'id'].some((key) => intValue(verse[key]) === verseNumber);
    });
    if (explicit) return explicit;
    return verses[verseNumber - 1] || null;
  }
  if (verses && typeof verses === 'object') {
    return verses[String(verseNumber)] || verses[verseNumber] || null;
  }
  return null;
}

function hasUsableText(value) {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasUsableText);
  if (value && typeof value === 'object') {
    if (hasUsableText(value.text)) return true;
    if (hasUsableText(value.rawText)) return true;
    for (const key of ['KJV', 'NRSV', 'Rotherham', 'DRB', 'NABRE', 'NABRE_INTERNAL']) {
      if (hasUsableText(value[key])) return true;
    }
    if (value.text && typeof value.text === 'object') return Object.values(value.text).some(hasUsableText);
  }
  return false;
}

const report = {
  result: 'OK',
  targets,
  checked: [],
  failures: [],
  reportPath
};

for (const target of targets) {
  const label = `${target.identity_id} ${target.chapter}:${target.verse}`;
  const fileRel = candidatePathForIdentity(target.identity_id);
  if (!fileRel) {
    report.failures.push(`${label}: no file mapping`);
    continue;
  }

  const filePath = path.join(process.cwd(), fileRel);
  if (!fs.existsSync(filePath)) {
    report.failures.push(`${label}: file not found ${fileRel}`);
    continue;
  }

  let data;
  try {
    data = readJson(filePath);
  } catch (error) {
    report.failures.push(`${label}: JSON read failed ${error.message}`);
    continue;
  }

  const chapter = getChapter(data, target.chapter);
  if (!chapter) {
    report.failures.push(`${label}: chapter not found in ${fileRel}`);
    continue;
  }

  const verse = getVerse(chapter, target.verse);
  if (!verse) {
    report.failures.push(`${label}: verse not found in ${fileRel}`);
    continue;
  }

  if (!hasUsableText(verse)) {
    report.failures.push(`${label}: verse text not found in ${fileRel}`);
    continue;
  }

  report.checked.push({
    identity_id: target.identity_id,
    chapter: target.chapter,
    verse: target.verse,
    path: fileRel
  });
}

if (report.failures.length) report.result = 'FAIL';

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify({
  result: report.result,
  checkedCount: report.checked.length,
  failureCount: report.failures.length,
  firstFailures: report.failures.slice(0, 20),
  reportPath
}, null, 2));

if (report.result === 'OK') {
  console.log('ALL PASSED');
  console.log('NEXT: Catholic corpus addressability audit is clean.');
} else {
  console.log('ALL FAILED');
  console.log('NEXT: Inspect Catholic corpus addressability report before moving to LOTH.');
  process.exitCode = 1;
}
