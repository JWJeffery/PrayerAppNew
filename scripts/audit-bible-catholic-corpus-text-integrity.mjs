import fs from 'fs';

const profilePath = 'data/bible/registry/canon-profiles/roman-catholic.draft.json';
const reportPath = process.env.CATHOLIC_CORPUS_AUDIT_REPORT || '/tmp/bible-catholic-corpus-text-integrity-audit.json';

const catholicFormRiskIds = new Set([
  'TOBIT',
  'JUDITH',
  'ESTHER',
  'DANIEL',
  'WISDOM',
  'SIRACH',
  'BARUCH',
  '1_MACCABEES',
  '2_MACCABEES'
]);

const report = {
  result: 'OK',
  profilePath,
  profileStatus: null,
  profileCompleteness: null,
  entryCount: 0,
  corpusPassCount: 0,
  corpusFailCount: 0,
  warningCount: 0,
  catholicFormRiskCount: 0,
  catholicFormRiskEntries: [],
  failures: [],
  warnings: [],
  entries: []
};

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function looksLikeVerseKey(key) {
  return /^[0-9]+[a-zA-Z]?$/.test(String(key));
}

function scanPayload(value, path = '$', stats = null) {
  if (!stats) {
    stats = {
      stringLeafCount: 0,
      nonEmptyStringLeafCount: 0,
      emptyStringLeafCount: 0,
      objectCount: 0,
      arrayCount: 0,
      maxDepth: 0,
      verseKeyCount: 0,
      chapterKeyCount: 0,
      likelyVerseObjects: 0,
      likelyChapterContainers: 0
    };
  }

  const depth = path.split('.').length - 1;
  if (depth > stats.maxDepth) stats.maxDepth = depth;

  if (typeof value === 'string') {
    stats.stringLeafCount += 1;
    if (value.trim()) stats.nonEmptyStringLeafCount += 1;
    else stats.emptyStringLeafCount += 1;
    return stats;
  }

  if (Array.isArray(value)) {
    stats.arrayCount += 1;
    value.forEach((item, index) => scanPayload(item, `${path}[${index}]`, stats));
    return stats;
  }

  if (value && typeof value === 'object') {
    stats.objectCount += 1;
    const keys = Object.keys(value);
    const numericKeys = keys.filter(looksLikeVerseKey);

    if (numericKeys.length >= 2) stats.likelyChapterContainers += 1;
    stats.verseKeyCount += numericKeys.length;

    for (const key of keys) {
      if (/chapter/i.test(key)) stats.chapterKeyCount += 1;
      if (/verse/i.test(key)) stats.likelyVerseObjects += 1;
      scanPayload(value[key], `${path}.${key}`, stats);
    }
  }

  return stats;
}

function detectTopShape(json) {
  if (Array.isArray(json)) return 'array';
  if (!json || typeof json !== 'object') return typeof json;

  const keys = Object.keys(json);
  const lower = new Set(keys.map(key => key.toLowerCase()));

  if (lower.has('chapters')) return 'object_with_chapters';
  if (lower.has('verses')) return 'object_with_verses';
  if (keys.some(looksLikeVerseKey)) return 'numeric_keyed_object';
  return `object_keys:${keys.slice(0, 8).join(',')}`;
}

function sourceStatsFor(path) {
  const raw = fs.readFileSync(path, 'utf8');
  const json = JSON.parse(raw);
  return {
    bytes: Buffer.byteLength(raw, 'utf8'),
    top_shape: detectTopShape(json),
    ...scanPayload(json)
  };
}

if (!fs.existsSync(profilePath)) {
  report.result = 'FAIL';
  report.failures.push(`${profilePath} missing`);
} else {
  const profile = readJson(profilePath);
  const entries = Array.isArray(profile.entries) ? profile.entries : [];
  const seenSources = new Map();

  report.profileStatus = profile.status || null;
  report.profileCompleteness = profile.completeness || null;
  report.entryCount = entries.length;

  if (profile.status !== 'draft_complete_profile') report.failures.push(`Roman Catholic profile status is ${profile.status}`);
  if (profile.completeness !== 'complete_roman_catholic_canon_profile_entries_73') report.failures.push(`Roman Catholic profile completeness is ${profile.completeness}`);
  if (entries.length !== 73) report.failures.push(`Roman Catholic profile expected 73 entries, found ${entries.length}`);

  for (const entry of entries) {
    const item = {
      identity_id: entry.identity_id || null,
      preferred_title: entry.preferred_title || null,
      source_path: entry.source_path || null,
      canonical_status: entry.canonical_status || null,
      ordinary_chapter_verse_resolver_candidate: entry.ordinary_chapter_verse_resolver_candidate === true,
      corpus_text_ok: false,
      stats: null,
      failures: [],
      warnings: []
    };

    if (catholicFormRiskIds.has(entry.identity_id)) {
      report.catholicFormRiskEntries.push({
        identity_id: entry.identity_id,
        source_path: entry.source_path,
        canonical_status: entry.canonical_status
      });
    }

    if (!entry.source_path) {
      item.failures.push('missing source_path');
    } else if (!fs.existsSync(entry.source_path)) {
      item.failures.push('source file missing');
    } else {
      if (seenSources.has(entry.source_path)) {
        item.failures.push(`duplicate source_path also used by ${seenSources.get(entry.source_path)}`);
      } else {
        seenSources.set(entry.source_path, entry.identity_id || 'UNKNOWN');
      }

      try {
        item.stats = sourceStatsFor(entry.source_path);

        if (item.stats.bytes <= 20) item.failures.push('source file is suspiciously tiny');
        if (item.stats.nonEmptyStringLeafCount === 0) item.failures.push('no non-empty text leaves found');

        if (entry.ordinary_chapter_verse_resolver_candidate === true) {
          if (item.stats.nonEmptyStringLeafCount < 5) item.failures.push('ordinary resolver candidate has fewer than 5 non-empty text leaves');
          if (item.stats.verseKeyCount === 0 && item.stats.likelyVerseObjects === 0) item.warnings.push('no obvious verse-key or verse-field markers');
          if (item.stats.likelyChapterContainers === 0 && item.stats.chapterKeyCount === 0) item.warnings.push('no obvious chapter container markers');
        }

        item.corpus_text_ok = item.failures.length === 0;
      } catch (error) {
        item.failures.push(`JSON parse/read failure: ${error.message}`);
      }
    }

    if (item.failures.length) {
      report.corpusFailCount += 1;
      for (const failure of item.failures) report.failures.push(`${item.identity_id || 'UNKNOWN'}: ${failure}`);
    } else {
      report.corpusPassCount += 1;
    }

    if (item.warnings.length) {
      report.warningCount += item.warnings.length;
      for (const warning of item.warnings) report.warnings.push(`${item.identity_id || 'UNKNOWN'}: ${warning}`);
    }

    report.entries.push(item);
  }
}

report.catholicFormRiskCount = report.catholicFormRiskEntries.length;
if (report.failures.length) report.result = 'FAIL';

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');

const compact = {
  result: report.result,
  profileStatus: report.profileStatus,
  profileCompleteness: report.profileCompleteness,
  entryCount: report.entryCount,
  corpusPassCount: report.corpusPassCount,
  corpusFailCount: report.corpusFailCount,
  warningCount: report.warningCount,
  catholicFormRiskCount: report.catholicFormRiskCount,
  catholicFormRiskEntries: report.catholicFormRiskEntries,
  firstFailures: report.failures.slice(0, 10),
  firstWarnings: report.warnings.slice(0, 10),
  reportPath
};

console.log(JSON.stringify(compact, null, 2));

if (report.failures.length) {
  console.log('ALL FAILED');
  console.log('NEXT: Repair Catholic biblical corpus before moving to LOTH.');
  process.exitCode = 1;
} else {
  console.log('ALL PASSED');
  console.log('NEXT: Catholic biblical corpus text-integrity audit is clean. Continue corpus completion checks before LOTH.');
}
