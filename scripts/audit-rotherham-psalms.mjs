#!/usr/bin/env node

/**
 * Quiet audit for the Rotherham Psalms source-scope import.
 *
 * Scope:
 * - Confirms data/bible/OT/psalms.json remains the governed 155-record
 *   consolidated psalter schema.
 * - Confirms Rotherham exists for Psalms 1-150 only.
 * - Confirms Psalms 151-155 remain outside the Rotherham source scope.
 * - Confirms import report / inventory / completion report agree.
 * - Confirms js/scripture-resolver.js can resolve Rotherham Psalms through
 *   the existing translation-selection path.
 *
 * Default output is one PASS/FAIL line. Use --json or VERBOSE_AUDIT=1 for detail.
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const VERBOSE = process.argv.includes('--json') || process.env.VERBOSE_AUDIT === '1';

const EXPECTED_SHA256 = 'd63488b149aadf4430fea6ddbc7c07395a12321a1b58799ce2dcb384ebf97627';

const PATHS = {
  psalms: 'data/bible/OT/psalms.json',
  resolver: 'js/scripture-resolver.js',
  inventory: 'documentation/rotherham-psalms-versification-inventory.json',
  importReport: 'documentation/rotherham-psalms-import-report.json',
  completionReport: 'documentation/rotherham-bible-source-scope-completion-report.json'
};

const findings = [];

function fail(code, message, detail = null) {
  findings.push({ level: 'FAIL', code, message, detail });
}

function info(code, message, detail = null) {
  findings.push({ level: 'INFO', code, message, detail });
}

function readText(rel) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    fail('missing_file', `Required file missing: ${rel}`);
    return null;
  }
  return fs.readFileSync(full, 'utf8');
}

function readJson(rel) {
  const text = readText(rel);
  if (text === null) return null;
  try {
    return JSON.parse(text);
  } catch (err) {
    fail('invalid_json', `Invalid JSON: ${rel}`, String(err.message || err));
    return null;
  }
}

function parsePsalmId(id) {
  const match = String(id || '').match(/^PSALM\s+(\d+)$/i);
  return match ? Number(match[1]) : null;
}

function countPrefixedRows(text) {
  if (typeof text !== 'string') return 0;
  return (text.match(/(^|\n)\s*\d+:\d+\s+/g) || []).length;
}

function firstLine(text) {
  return String(text || '').split(/\r?\n/)[0] || '';
}

async function runResolverSmoke() {
  const resolverSource = readText(PATHS.resolver);
  if (resolverSource === null) return;

  for (const marker of [
    'DEFAULT_BIBLE_TRANSLATION',
    '_selectBibleText',
    'options.translation',
    'psalms.json'
  ]) {
    if (!resolverSource.includes(marker)) {
      fail('resolver_contract_marker_missing', `Resolver contract marker missing: ${marker}`);
    }
  }

  const context = {
    console,
    window: {},
    document: undefined
  };
  context.globalThis = context;
  context.window = context;

  context.fetch = async (url) => {
    const rel = String(url).replace(/^\.\//, '').replace(/^\//, '');
    const full = path.resolve(ROOT, rel);
    const ok = fs.existsSync(full);

    return {
      ok,
      status: ok ? 200 : 404,
      async json() {
        if (!ok) throw new Error(`Missing local fetch target: ${rel}`);
        return JSON.parse(fs.readFileSync(full, 'utf8'));
      },
      async text() {
        if (!ok) throw new Error(`Missing local fetch target: ${rel}`);
        return fs.readFileSync(full, 'utf8');
      }
    };
  };

  try {
    vm.createContext(context);
    vm.runInContext(
      `${resolverSource}
;globalThis.__getScriptureText = (typeof getScriptureText !== 'undefined') ? getScriptureText : globalThis.getScriptureText;`,
      context,
      { filename: PATHS.resolver }
    );
  } catch (err) {
    fail('resolver_eval_failed', 'Could not evaluate scripture resolver in audit VM.', String(err.stack || err));
    return;
  }

  const getScriptureText = context.__getScriptureText || context.getScriptureText;
  if (typeof getScriptureText !== 'function') {
    fail('resolver_function_missing', 'getScriptureText was not available after resolver evaluation.');
    return;
  }

  const checks = [
    {
      code: 'rotherham_psalm_1_range',
      citation: 'Psalm 1:1-2',
      options: { translation: 'Rotherham' },
      includes: ['How happy the man', 'law of Yahweh']
    },
    {
      code: 'rotherham_psalms_alias',
      citation: 'Psalms 1:1-2',
      options: { translation: 'Rotherham' },
      includes: ['How happy the man', 'law of Yahweh']
    },
    {
      code: 'existing_kjv_psalm_path',
      citation: 'Psalm 1:1',
      options: { translation: 'KJV' },
      includes: ['Blessed is the man']
    },
    {
      code: 'orthodox_extended_psalm_preserved',
      citation: 'Psalm 151:1',
      options: { translation: 'Orthodox' },
      includes: ['I was small among my brothers']
    },
    {
      code: 'rotherham_extended_psalm_fallback_documented',
      citation: 'Psalm 151:1',
      options: { translation: 'Rotherham' },
      includes: ['I was small among my brothers']
    }
  ];

  for (const check of checks) {
    try {
      const result = String(await getScriptureText(check.citation, check.options));
      const missing = check.includes.filter(fragment => !result.includes(fragment));
      if (missing.length) {
        fail(
          check.code,
          `Resolver smoke failed for ${check.citation} ${JSON.stringify(check.options)}.`,
          { missing, preview: result.slice(0, 300) }
        );
      }
    } catch (err) {
      fail(
        check.code,
        `Resolver smoke threw for ${check.citation} ${JSON.stringify(check.options)}.`,
        String(err.stack || err)
      );
    }
  }
}

async function main() {
  const psalter = readJson(PATHS.psalms);
  const inventory = readJson(PATHS.inventory);
  const importReport = readJson(PATHS.importReport);
  const completionReport = readJson(PATHS.completionReport);

  if (!Array.isArray(psalter)) {
    fail('psalter_schema', 'data/bible/OT/psalms.json must be a top-level list.');
  } else {
    if (psalter.length !== 155) {
      fail('psalter_record_count', 'Consolidated psalter must contain 155 records.', { actual: psalter.length });
    }

    const ids = new Set();
    let rotherhamCount = 0;
    let rotherhamRows = 0;
    const missingRotherham = [];
    const extendedWithRotherham = [];
    const malformed = [];

    for (const record of psalter) {
      if (!record || typeof record !== 'object') {
        malformed.push({ id: null, reason: 'record_not_object' });
        continue;
      }

      const psalmNo = parsePsalmId(record.id);
      if (!psalmNo) {
        malformed.push({ id: record.id, reason: 'bad_id' });
        continue;
      }

      if (ids.has(psalmNo)) {
        malformed.push({ id: record.id, reason: 'duplicate_id' });
      }
      ids.add(psalmNo);

      if (!record.text || typeof record.text !== 'object' || Array.isArray(record.text)) {
        malformed.push({ id: record.id, reason: 'missing_text_object' });
        continue;
      }

      const rotherham = record.text.Rotherham;
      if (psalmNo >= 1 && psalmNo <= 150) {
        if (typeof rotherham !== 'string' || !rotherham.trim()) {
          missingRotherham.push(psalmNo);
        } else {
          rotherhamCount += 1;
          const rows = countPrefixedRows(rotherham);
          rotherhamRows += rows;
          if (!firstLine(rotherham).startsWith(`${psalmNo}:1 `)) {
            malformed.push({
              id: record.id,
              reason: 'rotherham_first_line_not_psalm_verse_prefixed',
              firstLine: firstLine(rotherham).slice(0, 120)
            });
          }
          if (rows < 1) {
            malformed.push({ id: record.id, reason: 'rotherham_has_no_prefixed_rows' });
          }
        }
      }

      if (psalmNo >= 151 && psalmNo <= 155 && Object.prototype.hasOwnProperty.call(record.text, 'Rotherham')) {
        extendedWithRotherham.push(psalmNo);
      }
    }

    const expectedIds = Array.from({ length: 155 }, (_, i) => i + 1);
    const missingIds = expectedIds.filter(n => !ids.has(n));
    const extraIds = [...ids].filter(n => n < 1 || n > 155).sort((a, b) => a - b);

    if (missingIds.length || extraIds.length) {
      fail('psalter_id_sequence', 'Psalm IDs must be exactly 1-155.', { missingIds, extraIds });
    }
    if (malformed.length) {
      fail('psalter_record_malformed', 'Malformed psalter records found.', malformed.slice(0, 20));
    }
    if (missingRotherham.length) {
      fail('rotherham_missing_psalms_1_150', 'Rotherham missing from Psalms 1-150.', missingRotherham);
    }
    if (extendedWithRotherham.length) {
      fail('rotherham_extended_psalms_contamination', 'Rotherham must not be present in Psalms 151-155.', extendedWithRotherham);
    }
    if (rotherhamCount !== 150) {
      fail('rotherham_count', 'Expected Rotherham on exactly 150 Psalm records.', { actual: rotherhamCount });
    }
    if (rotherhamRows !== 2461) {
      fail('rotherham_row_count', 'Expected 2,461 Rotherham Psalm verse rows.', { actual: rotherhamRows });
    }

    info('psalter_summary', 'Psalter import shape checked.', {
      recordCount: psalter.length,
      rotherhamCount,
      rotherhamRows,
      extendedSkipped: [151, 152, 153, 154, 155]
    });
  }

  if (inventory) {
    if (inventory.schema !== 'rotherham_psalms_versification_inventory_v1') {
      fail('inventory_schema', 'Unexpected Rotherham Psalms inventory schema.', inventory.schema);
    }
    const source = inventory.sourceWitness || {};
    if (source.sha256 !== EXPECTED_SHA256) {
      fail('inventory_source_sha', 'Inventory source SHA mismatch.', source.sha256);
    }
    if (source.sourcePsalmsChapterCount !== 150 || source.sourcePsalmsVerseRows !== 2461) {
      fail('inventory_source_scope', 'Inventory source scope should be 150 Psalms / 2,461 rows.', source);
    }
    const summary = inventory.alignmentSummary || {};
    if (summary.localRecordsWithoutRotherhamSourceCount !== 5) {
      fail('inventory_extended_scope_count', 'Inventory should show 5 local records outside Rotherham source scope.', summary);
    }
  }

  if (importReport) {
    if (importReport.schema !== 'rotherham_psalms_import_report_v1') {
      fail('import_report_schema', 'Unexpected Rotherham Psalms import report schema.', importReport.schema);
    }
    if (importReport.status !== 'imported_psalms_1_150_only') {
      fail('import_report_status', 'Unexpected Rotherham Psalms import report status.', importReport.status);
    }
    if ((importReport.sourceWitness || {}).sha256 !== EXPECTED_SHA256) {
      fail('import_report_source_sha', 'Import report source SHA mismatch.', (importReport.sourceWitness || {}).sha256);
    }
    const summary = importReport.importSummary || {};
    if (summary.importedPsalmCount !== 150) {
      fail('import_report_imported_count', 'Import report should show 150 imported Psalms.', summary);
    }
    if (JSON.stringify(summary.skippedExtendedPsalmNumbers || []) !== JSON.stringify([151, 152, 153, 154, 155])) {
      fail('import_report_extended_skip', 'Import report should show Psalms 151-155 skipped.', summary);
    }
  }

  if (completionReport) {
    if (completionReport.schema !== 'rotherham_bible_source_scope_completion_report_v1') {
      fail('completion_report_schema', 'Unexpected Rotherham Bible completion report schema.', completionReport.schema);
    }
    if (completionReport.status !== 'complete_source_scope_imported_and_resolver_verified') {
      fail('completion_report_status', 'Unexpected Rotherham Bible completion status.', completionReport.status);
    }
    const coverage = completionReport.coverage || {};
    if (!String(coverage.psalms || '').includes('1-150')) {
      fail('completion_report_psalms_scope', 'Completion report should record Psalms 1-150 source scope.', coverage);
    }
    if (!String(coverage.extendedPsalms151To155 || '').includes('outside Rotherham source scope')) {
      fail('completion_report_extended_scope', 'Completion report should record Psalms 151-155 outside source scope.', coverage);
    }
  }

  await runResolverSmoke();

  const failures = findings.filter(f => f.level === 'FAIL');

  if (VERBOSE) {
    console.log(JSON.stringify({
      ok: failures.length === 0,
      failures,
      findings
    }, null, 2));
  }

  if (failures.length) {
    console.error(`FAIL Rotherham Psalms audit: findings=${failures.length}`);
    if (!VERBOSE) {
      console.error(JSON.stringify(failures.slice(0, 10), null, 2));
    }
    process.exit(1);
  }

  const summary = findings.find(f => f.code === 'psalter_summary')?.detail || {};
  console.log(`PASS Rotherham Psalms audit: psalms=${summary.rotherhamCount || 150} rows=${summary.rotherhamRows || 2461} extendedSkipped=5 resolver=ok`);
}

main().catch((err) => {
  console.error(`FAIL Rotherham Psalms audit: unhandled error`);
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});

