import fs from 'fs';

const manifestPath = 'data/bible/translations/nabre-internal-source-lane/manifest.json';
const reportPath = process.env.NABRE_SOURCE_LANE_AUDIT_REPORT || '/tmp/bible-nabre-internal-source-lane-audit.json';

const report = {
  result: 'OK',
  manifestPath,
  translationKey: null,
  sourceStatus: null,
  internalCorpusWork: null,
  publicRendering: null,
  jsonFileCount: 0,
  estimatedBookCount: 0,
  estimatedChapterCount: 0,
  estimatedVerseCount: 0,
  failures: []
};

if (!fs.existsSync(manifestPath)) {
  report.failures.push('manifest missing');
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  report.translationKey = manifest.translation_key || null;
  report.sourceStatus = manifest.source_status || null;
  report.internalCorpusWork = manifest.internal_corpus_work || null;
  report.publicRendering = manifest.public_rendering || null;
  report.jsonFileCount = Number(manifest.json_file_count || 0);
  report.estimatedBookCount = Number(manifest.estimated_book_count || 0);
  report.estimatedChapterCount = Number(manifest.estimated_chapter_count || 0);
  report.estimatedVerseCount = Number(manifest.estimated_verse_count || 0);

  if (report.translationKey !== 'NABRE') report.failures.push('translation key is not NABRE');
  if (report.sourceStatus !== 'permission_application_pending') report.failures.push('source status must be permission_application_pending');
  if (report.internalCorpusWork !== 'authorized') report.failures.push('internal corpus work must be authorized');
  if (report.publicRendering !== 'not_cleared') report.failures.push('public rendering must be not_cleared');
  if (report.jsonFileCount < 1) report.failures.push('json file count too low');
  if (report.estimatedVerseCount < 30000) report.failures.push('estimated verse count too low');

  for (const item of manifest.files || []) {
    const file = `data/bible/translations/nabre-internal-source-lane/${item.file}`;
    if (!fs.existsSync(file)) report.failures.push(`missing source file: ${item.file}`);
    if (report.failures.length >= 10) break;
  }
}

if (report.failures.length) report.result = 'FAIL';

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify({
  result: report.result,
  translationKey: report.translationKey,
  sourceStatus: report.sourceStatus,
  internalCorpusWork: report.internalCorpusWork,
  publicRendering: report.publicRendering,
  jsonFileCount: report.jsonFileCount,
  estimatedBookCount: report.estimatedBookCount,
  estimatedChapterCount: report.estimatedChapterCount,
  estimatedVerseCount: report.estimatedVerseCount,
  failureCount: report.failures.length,
  reportPath
}, null, 2));

console.log(report.result === 'OK' ? 'ALL PASSED' : 'ALL FAILED');
console.log(report.result === 'OK'
  ? 'NEXT: NABRE internal source lane is governed and preserved. Public rendering remains not cleared.'
  : `NEXT: inspect ${reportPath}`);

if (report.result !== 'OK') process.exitCode = 1;
