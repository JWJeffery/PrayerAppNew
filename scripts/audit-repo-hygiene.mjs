#!/usr/bin/env node
// scripts/audit-repo-hygiene.mjs
// Repository hygiene audit for PrayerAppNew.
// Usage:
//   node scripts/audit-repo-hygiene.mjs          → quiet PASS/FAIL line
//   node scripts/audit-repo-hygiene.mjs --json   → print full result JSON
//   node scripts/audit-repo-hygiene.mjs --write  → write documentation/repo-hygiene-audit.json

import fs   from 'fs';
import path from 'path';

const WRITE  = process.argv.includes('--write');
const JSON_  = process.argv.includes('--json');
const ROOT   = process.cwd();
const OUT    = path.join(ROOT, 'documentation', 'repo-hygiene-audit.json');

const IGNORE_DIRS  = new Set(['.git', 'node_modules', '__MACOSX']);
const IGNORE_FILES = new Set(['.DS_Store', 'Thumbs.db', 'desktop.ini']);

const RE_TIMESTAMP_NAME = /\d{1,2}[.]\d{2}[.]\d{2}\s*(AM|PM)/i;
const RE_BAK            = /\.bak$/i;
const RE_PATCH_PY       = /^patch_.*\.py$/i;
const RE_RESOURCE_FORK  = /^\._/;

function walk(dir, results = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return results; }

  for (const e of entries) {
    if (IGNORE_FILES.has(e.name)) {
      results.push({ file: path.join(dir, e.name), size: 0, junk: true, reason: 'junk_file' });
      continue;
    }

    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      walk(path.join(dir, e.name), results);
    } else if (e.isFile()) {
      let size = 0;
      try { size = fs.statSync(path.join(dir, e.name)).size; } catch { /* ignore */ }
      results.push({ file: path.join(dir, e.name), size, junk: false });
    }
  }

  return results;
}

function dirShares(files) {
  const map = {};
  for (const f of files) {
    const rel = path.relative(ROOT, f.file);
    const top = rel.split(path.sep)[0] || '.';
    map[top] = (map[top] || 0) + f.size;
  }

  const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;

  return Object.entries(map)
    .map(([dir, bytes]) => ({ dir, bytes, pct: Math.round(bytes / total * 1000) / 10 }))
    .sort((a, b) => b.bytes - a.bytes);
}

function readJSON(filePath) {
  try {
    return { ok: true, data: JSON.parse(fs.readFileSync(filePath, 'utf8')) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function main() {
  const now = new Date().toISOString();
  const findings = [];
  const recommendedNextActions = [];
  const seenFindingKeys = new Set();

  function pushFinding(finding) {
    const key = `${finding.severity}|${finding.code}|${finding.file || ''}|${finding.note || ''}`;
    if (seenFindingKeys.has(key)) return;
    seenFindingKeys.add(key);
    findings.push(finding);
  }

  const allFiles = walk(ROOT);
  const totalBytes = allFiles.reduce((s, f) => s + f.size, 0);
  const fileCount = allFiles.length;

  const topDirectories = dirShares(allFiles).slice(0, 10);
  const largestFiles = [...allFiles]
    .sort((a, b) => b.size - a.size)
    .slice(0, 20)
    .map(f => ({ file: path.relative(ROOT, f.file), bytes: f.size }));

  for (const f of allFiles) {
    const rel = path.relative(ROOT, f.file);
    const base = path.basename(f.file);

    if (f.junk || IGNORE_FILES.has(base)) {
      pushFinding({ severity: 'FAIL', code: 'tracked_junk', file: rel, note: 'Tracked junk file should be removed and gitignored.' });
    } else if (RE_RESOURCE_FORK.test(base)) {
      pushFinding({ severity: 'FAIL', code: 'resource_fork', file: rel, note: 'Tracked macOS resource fork.' });
    } else if (RE_BAK.test(base)) {
      pushFinding({ severity: 'WARN', code: 'bak_file', file: rel, note: '.bak file tracked in repo.' });
    } else if (RE_PATCH_PY.test(base)) {
      pushFinding({ severity: 'WARN', code: 'patch_script', file: rel, note: 'patch_*.py script tracked. Review if still needed.' });
    }
  }

  const structureHistoryPathForArchiveCheck = path.join(ROOT, 'documentation', 'structure.hist1.json');
  const structureHistoryTextForArchiveCheck = fs.existsSync(structureHistoryPathForArchiveCheck)
    ? fs.readFileSync(structureHistoryPathForArchiveCheck, 'utf8')
    : '';

  for (const f of allFiles) {
    const rel = path.relative(ROOT, f.file);
    const base = path.basename(f.file);

    if (RE_TIMESTAMP_NAME.test(base)) {
      const archived = structureHistoryTextForArchiveCheck.includes(rel);
      pushFinding({
        severity: archived ? 'INFO' : 'WARN',
        code: archived ? 'legacy_timestamp_archive_indexed' : 'adhoc_timestamp_archive_unindexed',
        file: rel,
        note: archived
          ? 'Timestamp-style legacy archive is indexed in structure.hist1.json and preserved as read-only history. Not active documentation.'
          : 'Filename contains time-stamp style name. Add a pointer in structure.hist1.json rather than treating it as active documentation.'
      });
    }
  }

  const required = [
    'package.json',
    'structure.json',
    'project_roadmap.json',
    'documentation/structure.hist1.json',
  ];

  for (const r of required) {
    if (!fs.existsSync(path.join(ROOT, r))) {
      pushFinding({ severity: 'FAIL', code: 'missing_required_file', file: r, note: 'Required control file is absent.' });
    }
  }

  const controlFiles = [
    'package.json',
    'structure.json',
    'project_roadmap.json',
    'documentation/structure.hist1.json',
  ];

  for (const cf of controlFiles) {
    const full = path.join(ROOT, cf);
    if (fs.existsSync(full)) {
      const r = readJSON(full);
      if (!r.ok) {
        pushFinding({ severity: 'FAIL', code: 'invalid_json', file: cf, note: `JSON parse error: ${r.error}` });
      }
    }
  }

  const histPath = path.join(ROOT, 'documentation', 'structure.hist1.json');
  const docsPath = path.join(ROOT, 'documentation');

  if (fs.existsSync(histPath) && fs.existsSync(docsPath)) {
    const hr = readJSON(histPath);
    if (hr.ok) {
      const histText = fs.readFileSync(histPath, 'utf8');
      let docEntries = [];
      try { docEntries = fs.readdirSync(docsPath); } catch { docEntries = []; }

      const structureArchives = docEntries
        .filter(name => /^structure-archive/.test(name))
        .map(name => `documentation/${name}`);

      const missingArchivePointers = structureArchives.filter(rel => !histText.includes(rel));

      if (missingArchivePointers.length > 0) {
        pushFinding({
          severity: 'WARN',
          code: 'archive_pointer_missing_from_structure_history',
          count: missingArchivePointers.length,
          files: missingArchivePointers,
          note: 'structure.hist1.json does not yet index every structure archive file. Add pointers rather than duplicating archive contents.'
        });
        recommendedNextActions.push('Index all structure archive files in documentation/structure.hist1.json archive_index.');
      }
    }
  }

  const structPath = path.join(ROOT, 'structure.json');
  if (fs.existsSync(structPath)) {
    const sr = readJSON(structPath);
    if (sr.ok) {
      const todos = sr.data?.admin?.todos || [];
      const completedTodos = todos.filter(t => t.status === 'done');

      if (completedTodos.length > 0) {
        pushFinding({
          severity: 'WARN',
          code: 'completed_todos_in_live_structure',
          count: completedTodos.length,
          ids: completedTodos.map(t => t.id),
          note: `${completedTodos.length} completed admin.todos remain in live structure.json. Archive to documentation/structure.hist1.json.`
        });
        recommendedNextActions.push('Move completed admin.todos from structure.json into structure.hist1.json as archived work records.');
      }
    }
  }

  const sizeProfile = {};
  for (const cf of ['structure.json', 'project_roadmap.json', 'documentation/structure.hist1.json']) {
    const full = path.join(ROOT, cf);
    if (fs.existsSync(full)) {
      const bytes = fs.statSync(full).size;
      sizeProfile[cf] = { bytes, kb: Math.round(bytes / 1024) };

      if (['structure.json', 'project_roadmap.json'].includes(cf) && bytes > 200_000) {
        pushFinding({
          severity: 'WARN',
          code: 'large_live_control_file',
          file: cf,
          bytes,
          note: `Live control file exceeds 200 KB (${Math.round(bytes / 1024)} KB). Move historical/narrative prose to documentation/structure.hist1.json or dated archives.`
        });
        recommendedNextActions.push(`Trim ${cf}: move completed/historical content to archive files.`);
      } else if (cf === 'documentation/structure.hist1.json' && bytes > 500_000) {
        pushFinding({
          severity: 'INFO',
          code: 'large_history_archive',
          file: cf,
          bytes,
          note: `History archive is ${Math.round(bytes / 1024)} KB. This is acceptable if it is preserving retired governance/history rather than driving runtime or dashboard state.`
        });
      }
    }
  }

  if (fs.existsSync(path.join(ROOT, 'structure.json')) && fs.existsSync(path.join(ROOT, 'project_roadmap.json'))) {
    const sr = readJSON(path.join(ROOT, 'structure.json'));
    const rr = readJSON(path.join(ROOT, 'project_roadmap.json'));

    if (sr.ok && rr.ok) {
      const navInStruct =
        sr.data?.project_manifest?.roman_loth_current_state?.next_navigation_summary ||
        sr.data?.roman_loth_current_state?.next_navigation_summary ||
        '';
      const navInRoadmap = rr.data?.current_repo_state?.current_navigation_summary || '';

      if (navInStruct && navInRoadmap && navInStruct.trim() === navInRoadmap.trim() && navInStruct.length > 120) {
        pushFinding({
          severity: 'WARN',
          code: 'duplicate_navigation_summary',
          note: 'Long current_navigation_summary is identical in structure.json and project_roadmap.json.',
          length: navInStruct.length
        });
        recommendedNextActions.push('Collapse duplicate navigation summary: keep one pointer in project_roadmap.json; shorten or remove duplicate in structure.json.');
      }

      const longRoadmapNotes = [];
      const phases = Array.isArray(rr.data?.phase_plan) ? rr.data.phase_plan : [];
      for (const [index, phase] of phases.entries()) {
        const note = typeof phase?.governance_note === 'string' ? phase.governance_note : '';
        if (note.length > 1500) {
          longRoadmapNotes.push({
            path: `project_roadmap.json phase_plan[${index}].governance_note`,
            phaseId: phase.phase_id || phase.id || null,
            length: note.length
          });
        }
      }

      if (longRoadmapNotes.length > 0) {
        pushFinding({
          severity: 'WARN',
          code: 'long_backward_roadmap_history',
          count: longRoadmapNotes.length,
          notes: longRoadmapNotes,
          note: 'Roadmap contains long backward-looking governance/history prose. Archive tranche history to documentation/structure.hist1.json and keep roadmap forward-looking.'
        });
        recommendedNextActions.push('Trim long roadmap governance/history notes into documentation/structure.hist1.json; keep project_roadmap.json forward-looking.');
      }

      if (Array.isArray(rr.data?.roman_loth_progress_records) && rr.data.roman_loth_progress_records.length > 0) {
        pushFinding({
          severity: 'WARN',
          code: 'backward_progress_records_in_roadmap',
          count: rr.data.roman_loth_progress_records.length,
          note: 'project_roadmap.json contains backward-looking progress record arrays. Archive these to documentation/structure.hist1.json and leave roadmap current/future-facing.'
        });
        recommendedNextActions.push('Move roman_loth_progress_records out of project_roadmap.json into documentation/structure.hist1.json.');
      }
    }
  }

  const jsFiles = allFiles.filter(f => f.file.endsWith('.js') && f.size > 150_000);
  for (const f of jsFiles) {
    const rel = path.relative(ROOT, f.file);
    try {
      const src = fs.readFileSync(f.file, 'utf8');
      const stringLiterals =
        (src.match(/`[^`]{200,}`/g) || []).length +
        (src.match(/"[^"]{200,}"/g) || []).length;

      if (stringLiterals > 10) {
        pushFinding({
          severity: 'INFO',
          code: 'large_js_corpus_module',
          file: rel,
          bytes: f.size,
          longStringCount: stringLiterals,
          note: 'Large JS file with high string-literal payload. Candidate for future data-module extraction (Phase 5 / database migration). Not a deletion candidate.'
        });
      }
    } catch {
      /* ignore read errors */
    }
  }

  const bibleDir = path.join(ROOT, 'data', 'bible');
  if (fs.existsSync(bibleDir)) {
    let bibleBytes = 0;
    const bw = walk(bibleDir);
    for (const f of bw) bibleBytes += f.size;

    pushFinding({
      severity: 'INFO',
      code: 'bible_corpus_size',
      bytes: bibleBytes,
      kb: Math.round(bibleBytes / 1024),
      note: `Bible corpus is ${Math.round(bibleBytes / 1024)} KB. Expected growth as translations are added. Not a hygiene defect.`
    });
  }

  if (!WRITE && !fs.existsSync(OUT)) {
    pushFinding({
      severity: 'WARN',
      code: 'missing_hygiene_audit_file',
      file: 'documentation/repo-hygiene-audit.json',
      note: 'Hygiene audit output file not present. Run: npm run audit:repo-hygiene:write'
    });
  }

  const failCount = findings.filter(f => f.severity === 'FAIL').length;
  const warnCount = findings.filter(f => f.severity === 'WARN').length;
  const infoCount = findings.filter(f => f.severity === 'INFO').length;
  const status = failCount > 0 ? 'FAIL' : 'PASS';

  if (!recommendedNextActions.length) {
    recommendedNextActions.push('No critical hygiene actions required at this time.');
  }

  const dashboardCards = [
    { label: 'Status', value: status },
    { label: 'Files', value: String(fileCount) },
    { label: 'Total Size', value: `${(totalBytes / 1_048_576).toFixed(2)} MB` },
    { label: 'FAIL', value: String(failCount) },
    { label: 'WARN', value: String(warnCount) },
    { label: 'INFO', value: String(infoCount) },
  ];

  const result = {
    schema: 'repo-hygiene-audit-v1',
    generatedAt: now,
    status,
    summary: {
      totalBytes,
      totalMB: parseFloat((totalBytes / 1_048_576).toFixed(2)),
      fileCount,
      failCount,
      warnCount,
      infoCount,
    },
    sizeProfile,
    topDirectories: topDirectories.slice(0, 8),
    largestFiles: largestFiles.slice(0, 10),
    findings,
    dashboardCards,
    recommendedNextActions: recommendedNextActions.slice(0, 10),
  };

  if (WRITE) {
    try {
      fs.mkdirSync(path.dirname(OUT), { recursive: true });
      fs.writeFileSync(OUT, JSON.stringify(result, null, 2), 'utf8');
    } catch (e) {
      console.error(`FAIL repo-hygiene audit: could not write output: ${e.message}`);
      process.exit(1);
    }
  }

  if (JSON_) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    const detail = `files=${fileCount} bytes=${totalBytes} fail=${failCount} warn=${warnCount}`;
    console.log(`${status} repo-hygiene audit: ${detail}`);
  }

  if (failCount > 0) process.exit(1);
}

main().catch(err => {
  console.error('FAIL repo-hygiene audit: unhandled error');
  console.error(err?.stack ?? err);
  process.exit(1);
});
