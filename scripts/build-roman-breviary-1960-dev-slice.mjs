import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BASE = path.join(ROOT, 'data', 'roman-breviary-1960-1962');
const SOURCE_REL = 'web/www/horas/Latin/Sancti/11-02.txt';
const SOURCE_PATH = path.join(BASE, 'source', 'divinum-officium', SOURCE_REL);
const PIN_PATH = path.join(BASE, 'source', 'divinum-officium', 'source-pin.json');
const UNITS_PATH = path.join(BASE, 'units', 'dev-vertical-slice.json');
const MANIFEST_PATH = path.join(BASE, 'manifests', '2026.json');

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function readJson(filePath) {
  return JSON.parse(readUtf8(filePath));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function parseSections(sourceText) {
  const sections = {};
  let current = null;

  for (const line of sourceText.split(/\r?\n/)) {
    const match = line.match(/^\[(.+?)\]\s*$/);
    if (match) {
      current = match[1].trim();
      sections[current] = [];
      continue;
    }

    if (current) sections[current].push(line);
  }

  return Object.fromEntries(
    Object.entries(sections).map(([key, lines]) => [
      key,
      lines.join('\n').replace(/^\s+|\s+$/g, '')
    ])
  );
}

function requireSection(sections, key) {
  const value = sections[key];
  if (!value) throw new Error(`Missing required Divinum section [${key}] in ${SOURCE_REL}`);
  return value;
}

function normalizeDivinumDisplayText(rawText) {
  const diagnostics = [];
  const displayLines = [];

  for (const line of rawText.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed) {
      displayLines.push('');
      continue;
    }

    if (trimmed.startsWith('!')) {
      const rubricLabel = trimmed.slice(1).trim();
      if (rubricLabel) {
        diagnostics.push({
          type: 'divinum-display-marker',
          message: `Display marker stripped from user-facing text: ${rubricLabel}`
        });
      }
      continue;
    }

    if (trimmed.startsWith('&')) {
      diagnostics.push({
        type: 'unresolved-divinum-macro',
        message: `Divinum macro not expanded in dev slice: ${trimmed}`
      });
      continue;
    }

    displayLines.push(line);
  }

  return {
    text: displayLines.join('\n').replace(/^\s+|\s+$/g, ''),
    diagnostics
  };
}

const MATINS_READING_SECTIONS = [
  ['Lectio4', 'Cap. 2 et 3'],
  ['Lectio5', 'Cap. 4'],
  ['Lectio6', 'Cap. 18'],
  ['Lectio7', '1 Cor 15:12-22'],
  ['Lectio8', '1 Cor 15:35-44'],
  ['Lectio9', '1 Cor 15:51-58']
];

function unitSource(sourcePin, section) {
  return {
    repo: sourcePin.repo,
    commit: sourcePin.commit,
    path: SOURCE_REL,
    section
  };
}

function buildReadingUnit(sourcePin, sections, section, citation) {
  const slug = section.toLowerCase();
  const rawText = requireSection(sections, section);
  const normalized = normalizeDivinumDisplayText(rawText);

  return [
    `rb1960.la.sancti.11-02.${slug}`,
    {
      key: `rb1960.la.sancti.11-02.${slug}`,
      kind: 'reading',
      citation,
      text: normalized.text,
      raw_text: rawText,
      display_diagnostics: normalized.diagnostics,
      source: unitSource(sourcePin, section)
    }
  ];
}

function buildUnits({ sourcePin, sections }) {
  const readingUnits = Object.fromEntries(
    MATINS_READING_SECTIONS.map(([section, citation]) =>
      buildReadingUnit(sourcePin, sections, section, citation)
    )
  );

  return {
    schema_version: 'roman_breviary_1960_1962_source_units_v0_dev_slice',
    source_pin: sourcePin,
    tradition: 'roman_catholic',
    office_family: 'roman_breviary',
    edition_or_recension: 'rubrics_1960_1962',
    language: 'la',
    units: {
      ...readingUnits,
      'rb1960.la.sancti.11-02.conclusio': (() => {
        const rawText = requireSection(sections, 'Conclusio');
        const normalized = normalizeDivinumDisplayText(rawText);

        return {
          key: 'rb1960.la.sancti.11-02.conclusio',
          kind: 'dismissal',
          citation: 'Conclusio specialis',
          text: normalized.text,
          raw_text: rawText,
          display_diagnostics: normalized.diagnostics,
          source: unitSource(sourcePin, 'Conclusio')
        };
      })()
    }
  };
}

function buildManifest({ sourcePin }) {
  return {
    schema_version: 'roman_breviary_1960_1962_assembly_manifest_v1',
    source_pin: sourcePin,
    tradition: 'roman_catholic',
    office_family: 'roman_breviary',
    edition_or_recension: 'rubrics_1960_1962',
    language: 'la',
    calendar_scope: 'roman_general',
    year: 2026,
    generated_at: '2026-06-20T00:00:00Z',
    days: {
      '2026-11-02': {
        liturgical_context: {
          native_label: 'In Commemoratione Omnium Fidelium Defunctorum',
          rank: 'I. classis',
          source_path: SOURCE_REL
        },
        hours: {
          matins: {
            label: 'Matutinum',
            blocks: [
              {
                role: 'reading',
                label: 'Lectio IV',
                unit_refs: ['rb1960.la.sancti.11-02.lectio4']
              },
              {
                role: 'reading',
                label: 'Lectio V',
                unit_refs: ['rb1960.la.sancti.11-02.lectio5']
              },
              {
                role: 'reading',
                label: 'Lectio VI',
                unit_refs: ['rb1960.la.sancti.11-02.lectio6']
              },
              {
                role: 'reading',
                label: 'Lectio VII',
                unit_refs: ['rb1960.la.sancti.11-02.lectio7']
              },
              {
                role: 'reading',
                label: 'Lectio VIII',
                unit_refs: ['rb1960.la.sancti.11-02.lectio8']
              },
              {
                role: 'reading',
                label: 'Lectio IX',
                unit_refs: ['rb1960.la.sancti.11-02.lectio9']
              },
              {
                role: 'dismissal',
                label: 'Conclusio',
                unit_refs: ['rb1960.la.sancti.11-02.conclusio']
              }
            ],
            diagnostics: [
              {
                type: 'coverage-gap',
                message: 'Dev vertical slice only; not a complete Matins office.'
              }
            ]
          }
        }
      }
    }
  };
}

const sourcePin = readJson(PIN_PATH);
const sourceText = readUtf8(SOURCE_PATH);
const sections = parseSections(sourceText);

if (sourcePin.commit !== '0ce8747d7dba3276fc05937635e02360b49a60a6') {
  throw new Error(`Unexpected Roman Breviary source pin: ${sourcePin.commit}`);
}

writeJson(UNITS_PATH, buildUnits({ sourcePin, sections }));
writeJson(MANIFEST_PATH, buildManifest({ sourcePin }));

console.log('Roman Breviary 1960/1962 dev slice generated');
console.log(`source: ${SOURCE_REL}`);
console.log(`units: ${path.relative(ROOT, UNITS_PATH)}`);
console.log(`manifest: ${path.relative(ROOT, MANIFEST_PATH)}`);
