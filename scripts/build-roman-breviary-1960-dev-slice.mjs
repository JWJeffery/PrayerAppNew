import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BASE = path.join(ROOT, 'data', 'roman-breviary-1960-1962');
const SOURCE_REL = 'web/www/horas/Latin/Sancti/11-02.txt';
const C9_SOURCE_REL = 'web/www/horas/Latin/Commune/C9.txt';
const SOURCE_PATH = path.join(BASE, 'source', 'divinum-officium', SOURCE_REL);
const C9_SOURCE_PATH = path.join(BASE, 'source', 'divinum-officium', C9_SOURCE_REL);
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

function requireSection(sections, key, sourceRel) {
  const value = sections[key];
  if (!value) throw new Error(`Missing required Divinum section [${key}] in ${sourceRel}`);
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

    if (trimmed === '_') {
      continue;
    }

    if (trimmed.startsWith('!')) {
      const markerLabel = trimmed.slice(1).trim();
      if (markerLabel) {
        diagnostics.push({
          type: 'divinum-display-marker',
          message: `Display marker stripped from user-facing text: ${markerLabel}`
        });
      }
      continue;
    }

    if (trimmed === '$Requiem') {
      displayLines.push('V. Réquiem ætérnam dona eis, Dómine.');
      displayLines.push('R. Et lux perpétua lúceat eis.');
      continue;
    }

    if (/^[@#$&]/.test(trimmed)) {
      diagnostics.push({
        type: 'unresolved-divinum-macro',
        message: `Divinum macro not expanded in dev slice: ${trimmed}`
      });
      continue;
    }

    if (/^\(.+\)$/.test(trimmed)) {
      diagnostics.push({
        type: 'divinum-rubric-line',
        message: `Rubric/control line stripped from user-facing text: ${trimmed}`
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

function inferCitation(rawText, fallback) {
  const marker = rawText
    .split(/\r?\n/)
    .map(line => line.trim())
    .find(line => line.startsWith('!'));

  return marker ? marker.slice(1).trim() : fallback;
}

const MATINS_READING_SECTIONS = [
  ['Lectio1', 'Job 7:16-21'],
  ['Lectio2', 'Job 14:1-6'],
  ['Lectio3', 'Job 19:20-27'],
  ['Lectio4', 'Cap. 2 et 3'],
  ['Lectio5', 'Cap. 4'],
  ['Lectio6', 'Cap. 18'],
  ['Lectio7', '1 Cor 15:12-22'],
  ['Lectio8', '1 Cor 15:35-44'],
  ['Lectio9', '1 Cor 15:51-58']
];

const MATINS_READING_LABELS = {
  Lectio1: 'Lectio I',
  Lectio2: 'Lectio II',
  Lectio3: 'Lectio III',
  Lectio4: 'Lectio IV',
  Lectio5: 'Lectio V',
  Lectio6: 'Lectio VI',
  Lectio7: 'Lectio VII',
  Lectio8: 'Lectio VIII',
  Lectio9: 'Lectio IX'
};

const MATINS_RESPONSORY_LABELS = {
  Responsory1: 'Responsorium I',
  Responsory2: 'Responsorium II',
  Responsory3: 'Responsorium III',
  Responsory4: 'Responsorium IV',
  Responsory5: 'Responsorium V',
  Responsory6: 'Responsorium VI',
  Responsory7: 'Responsorium VII',
  Responsory8: 'Responsorium VIII',
  Responsory9: 'Responsorium IX'
};

const MATINS_NOCTURNS = [
  {
    label: 'Nocturnus I',
    sections: ['Lectio1', 'Lectio2', 'Lectio3'],
    antiphonRange: [0, 3],
    versum: 'Nocturn 1 Versum'
  },
  {
    label: 'Nocturnus II',
    sections: ['Lectio4', 'Lectio5', 'Lectio6'],
    antiphonRange: [3, 6],
    versum: 'Nocturn 2 Versum'
  },
  {
    label: 'Nocturnus III',
    sections: ['Lectio7', 'Lectio8', 'Lectio9'],
    antiphonRange: [6, 9],
    versum: 'Nocturn 3 Versum'
  }
];

function unitSource(sourcePin, section, sourceRel = SOURCE_REL) {
  return {
    repo: sourcePin.repo,
    commit: sourcePin.commit,
    path: sourceRel,
    section
  };
}

function resolveAppointedSection(sections, c9Sections, section) {
  const appointedText = requireSection(sections, section, SOURCE_REL);
  const directive = appointedText.trim();
  const c9Match = directive.match(/^@Commune\/C9(?::([A-Za-z0-9 _-]+))?$/);

  if (!c9Match) {
    return {
      rawText: appointedText,
      sourceRel: SOURCE_REL,
      sourceSection: section
    };
  }

  const sourceSection = c9Match[1] || section;

  return {
    rawText: requireSection(c9Sections, sourceSection, C9_SOURCE_REL),
    sourceRel: C9_SOURCE_REL,
    sourceSection,
    appointment: {
      path: SOURCE_REL,
      section,
      directive
    }
  };
}

function buildReadingUnit(sourcePin, sections, c9Sections, section, citation) {
  const slug = section.toLowerCase();
  const resolved = resolveAppointedSection(sections, c9Sections, section);
  const normalized = normalizeDivinumDisplayText(resolved.rawText);

  const unit = {
    key: `rb1960.la.sancti.11-02.${slug}`,
    kind: 'reading',
    citation: inferCitation(resolved.rawText, citation),
    text: normalized.text,
    raw_text: resolved.rawText,
    display_diagnostics: normalized.diagnostics,
    source: unitSource(sourcePin, resolved.sourceSection, resolved.sourceRel)
  };

  if (resolved.appointment) unit.appointment = resolved.appointment;

  return [unit.key, unit];
}

function buildResponsoryUnit(sourcePin, c9Sections, section) {
  const slug = section.toLowerCase().replace('responsory', 'responsorium');
  const rawText = requireSection(c9Sections, section, C9_SOURCE_REL);
  const normalized = normalizeDivinumDisplayText(rawText);

  return [
    `rb1960.la.sancti.11-02.${slug}`,
    {
      key: `rb1960.la.sancti.11-02.${slug}`,
      kind: 'responsory',
      citation: '',
      text: normalized.text,
      raw_text: rawText,
      display_diagnostics: normalized.diagnostics,
      source: unitSource(sourcePin, section, C9_SOURCE_REL)
    }
  ];
}

function parseMatinsAntiphonAppointments(rawText) {
  return rawText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [antiphon, psalm] = line.split(';;');
      return {
        antiphon: antiphon.trim(),
        psalm: (psalm || '').trim()
      };
    });
}

function formatMatinsPsalmody(appointments) {
  const lines = [];
  for (const item of appointments) {
    lines.push(`Ant. ${item.antiphon}`);
    lines.push(`Ps. ${item.psalm}`);
  }
  return lines.join('\n');
}

function buildInvitatoryUnit(sourcePin, c9Sections) {
  const section = 'Invit';
  const rawText = requireSection(c9Sections, section, C9_SOURCE_REL);
  const normalized = normalizeDivinumDisplayText(rawText);

  return [
    'rb1960.la.sancti.11-02.invitatorium',
    {
      key: 'rb1960.la.sancti.11-02.invitatorium',
      kind: 'invitatory',
      citation: '',
      text: normalized.text,
      raw_text: rawText,
      display_diagnostics: normalized.diagnostics,
      source: unitSource(sourcePin, section, C9_SOURCE_REL)
    }
  ];
}

function buildNocturnPsalmodyUnit(sourcePin, c9Sections, nocturnIndex, appointments) {
  const section = 'Ant Matutinum';
  const rawText = appointments
    .map(item => `${item.antiphon};;${item.psalm}`)
    .join('\n');
  const normalized = normalizeDivinumDisplayText(formatMatinsPsalmody(appointments));

  return [
    `rb1960.la.sancti.11-02.nocturnus${nocturnIndex}.psalmi-antiphonae`,
    {
      key: `rb1960.la.sancti.11-02.nocturnus${nocturnIndex}.psalmi-antiphonae`,
      kind: 'psalmody_appointment',
      citation: 'Antiphonae cum psalmis',
      text: normalized.text,
      raw_text: rawText,
      display_diagnostics: normalized.diagnostics,
      source: unitSource(sourcePin, section, C9_SOURCE_REL)
    }
  ];
}

function buildNocturnVersicleUnit(sourcePin, c9Sections, nocturnIndex, section) {
  const rawText = requireSection(c9Sections, section, C9_SOURCE_REL);
  const normalized = normalizeDivinumDisplayText(rawText);

  return [
    `rb1960.la.sancti.11-02.nocturnus${nocturnIndex}.versiculum`,
    {
      key: `rb1960.la.sancti.11-02.nocturnus${nocturnIndex}.versiculum`,
      kind: 'versicle',
      citation: '',
      text: normalized.text,
      raw_text: rawText,
      display_diagnostics: normalized.diagnostics,
      source: unitSource(sourcePin, section, C9_SOURCE_REL)
    }
  ];
}

function buildConclusioUnit(sourcePin, sections) {
  const rawText = requireSection(sections, 'Conclusio', SOURCE_REL);
  const normalized = normalizeDivinumDisplayText(rawText);

  return [
    'rb1960.la.sancti.11-02.conclusio',
    {
      key: 'rb1960.la.sancti.11-02.conclusio',
      kind: 'dismissal',
      citation: 'Conclusio specialis',
      text: normalized.text,
      raw_text: rawText,
      display_diagnostics: normalized.diagnostics,
      source: unitSource(sourcePin, 'Conclusio')
    }
  ];
}

function buildUnits({ sourcePin, sections, c9Sections }) {
  const readingUnits = Object.fromEntries(
    MATINS_READING_SECTIONS.map(([section, citation]) =>
      buildReadingUnit(sourcePin, sections, c9Sections, section, citation)
    )
  );

  const responsoryUnits = Object.fromEntries(
    Array.from({ length: 9 }, (_, index) =>
      buildResponsoryUnit(sourcePin, c9Sections, `Responsory${index + 1}`)
    )
  );

  const matinsAntiphons = parseMatinsAntiphonAppointments(
    requireSection(c9Sections, 'Ant Matutinum', C9_SOURCE_REL)
  );

  if (matinsAntiphons.length !== 9) {
    throw new Error(`Expected 9 Matins antiphon appointments, found ${matinsAntiphons.length}`);
  }

  const frameworkUnits = Object.fromEntries([
    buildInvitatoryUnit(sourcePin, c9Sections),
    ...MATINS_NOCTURNS.flatMap((nocturn, index) => [
      buildNocturnPsalmodyUnit(
        sourcePin,
        c9Sections,
        index + 1,
        matinsAntiphons.slice(nocturn.antiphonRange[0], nocturn.antiphonRange[1])
      ),
      buildNocturnVersicleUnit(sourcePin, c9Sections, index + 1, nocturn.versum)
    ])
  ]);

  const conclusioUnit = buildConclusioUnit(sourcePin, sections);

  return {
    schema_version: 'roman_breviary_1960_1962_source_units_v0_dev_slice',
    source_pin: sourcePin,
    tradition: 'roman_catholic',
    office_family: 'roman_breviary',
    edition_or_recension: 'rubrics_1960_1962',
    language: 'la',
    units: {
      ...frameworkUnits,
      ...readingUnits,
      ...responsoryUnits,
      [conclusioUnit[0]]: conclusioUnit[1]
    }
  };
}

function buildReadingResponsoryPair(section) {
  const number = section.replace('Lectio', '');

  return [
    {
      role: 'reading',
      label: MATINS_READING_LABELS[section],
      unit_refs: [`rb1960.la.sancti.11-02.${section.toLowerCase()}`]
    },
    {
      role: 'responsory',
      label: MATINS_RESPONSORY_LABELS[`Responsory${number}`],
      unit_refs: [`rb1960.la.sancti.11-02.responsorium${number}`]
    }
  ];
}

function buildNocturnBlock(nocturn, nocturnIndex) {
  return {
    role: 'nocturn',
    label: nocturn.label,
    blocks: [
      {
        role: 'psalmody',
        label: 'Psalmi et antiphonae',
        unit_refs: [`rb1960.la.sancti.11-02.nocturnus${nocturnIndex}.psalmi-antiphonae`]
      },
      {
        role: 'versicle',
        label: 'Versiculum',
        unit_refs: [`rb1960.la.sancti.11-02.nocturnus${nocturnIndex}.versiculum`]
      },
      ...nocturn.sections.flatMap(section => buildReadingResponsoryPair(section))
    ]
  };
}

function buildMatinsBlocks() {
  return [
    {
      role: 'invitatory',
      label: 'Invitatorium',
      unit_refs: ['rb1960.la.sancti.11-02.invitatorium']
    },
    ...MATINS_NOCTURNS.map((nocturn, index) => buildNocturnBlock(nocturn, index + 1)),
    {
      role: 'dismissal',
      label: 'Conclusio',
      unit_refs: ['rb1960.la.sancti.11-02.conclusio']
    }
  ];
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
            blocks: buildMatinsBlocks(),
            diagnostics: [
              {
                type: 'coverage-gap',
                message: 'Dev vertical slice only; Matins psalms, antiphons, and nocturn structure are not complete.'
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
const c9SourceText = readUtf8(C9_SOURCE_PATH);
const sections = parseSections(sourceText);
const c9Sections = parseSections(c9SourceText);

if (sourcePin.commit !== '0ce8747d7dba3276fc05937635e02360b49a60a6') {
  throw new Error(`Unexpected Roman Breviary source pin: ${sourcePin.commit}`);
}

writeJson(UNITS_PATH, buildUnits({ sourcePin, sections, c9Sections }));
writeJson(MANIFEST_PATH, buildManifest({ sourcePin }));

console.log('Roman Breviary 1960/1962 dev slice generated');
console.log(`source: ${SOURCE_REL}`);
console.log(`resolved source: ${C9_SOURCE_REL}`);
console.log(`units: ${path.relative(ROOT, UNITS_PATH)}`);
console.log(`manifest: ${path.relative(ROOT, MANIFEST_PATH)}`);
