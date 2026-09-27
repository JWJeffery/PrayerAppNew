import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BASE = path.join(ROOT, 'data', 'roman-breviary-1960-1962');
const SOURCE_REL = 'web/www/horas/Latin/Sancti/11-02.txt';
const C9_SOURCE_REL = 'web/www/horas/Latin/Commune/C9.txt';
const PRAYERS_SOURCE_REL = 'web/www/horas/Latin/Psalterium/Common/Prayers.txt';
const RUBRICAE_SOURCE_REL = 'web/www/horas/Latin/Psalterium/Common/Rubricae.txt';
const SOURCE_PATH = path.join(BASE, 'source', 'divinum-officium', SOURCE_REL);
const C9_SOURCE_PATH = path.join(BASE, 'source', 'divinum-officium', C9_SOURCE_REL);
const PIN_PATH = path.join(BASE, 'source', 'divinum-officium', 'source-pin.json');
const UNITS_PATH = path.join(BASE, 'units', 'dev-vertical-slice.json');
const MANIFEST_PATH = path.join(BASE, 'manifests', '2026.json');

// Full-audit pass, 2026-09-27 -- two macros the office file references but never spells out,
// because they're universal/common texts, not office-specific ones: `&Gloria` (Conclusio) and
// the Matins engine's own `$Pater totum secreto` push (web/cgi-bin/horas/specmatins.pl line 671,
// taken because our [Rule] contains "Limit Benedictiones" -- see
// documentation/ROMAN_BREVIARY_1960_1962_AUDIT.md's full-audit addendum for the Perl trace that
// established this). Both texts transcribed verbatim from the shared common-prayers source file,
// not paraphrased.
const GLORIA_PATRI_TEXT = 'V. Glória Patri, et Fílio, * et Spirítui Sancto.\nR. Sicut erat in princípio, et nunc, et semper, * et in sǽcula sæculórum. Amen.';
const PATER_TOTUM_SECRETO_TEXT = '« Pater Noster » dicitur totum secreto.';

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

function buildConclusioGloriaUnit(sourcePin) {
  // [Conclusio]'s own `&Gloria` macro, resolved: Core Contract §7 added a `doxology` role
  // specifically for exactly this (Gloria Patri), so it gets its own unit/block rather than
  // being folded into -- or left as an unresolved-macro diagnostic inside -- the dismissal unit.
  return [
    'rb1960.la.sancti.11-02.conclusio-doxology',
    {
      key: 'rb1960.la.sancti.11-02.conclusio-doxology',
      kind: 'doxology',
      citation: '',
      text: GLORIA_PATRI_TEXT,
      raw_text: '&Gloria',
      display_diagnostics: [],
      source: {
        repo: sourcePin.repo,
        commit: sourcePin.commit,
        path: PRAYERS_SOURCE_REL,
        section: 'Gloria',
        appointment: { path: SOURCE_REL, section: 'Conclusio', directive: '&Gloria' }
      }
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
      display_diagnostics: normalized.diagnostics.filter(d => !/&Gloria/.test(d.message)),
      source: unitSource(sourcePin, 'Conclusio')
    }
  ];
}

function buildPaterSecretoUnit(sourcePin, nocturnIndex) {
  // web/cgi-bin/horas/specmatins.pl's lectiones() sub: because this office's [Rule] contains
  // "Limit Benedictiones", the usual per-lesson "Jube, domne, benedicere" + blessing-response
  // ritual (9 exchanges) is skipped entirely, replaced by a single silent complete Pater Noster
  // once per nocturn (`$Pater totum secreto`, pushed once before that nocturn's lessons begin --
  // see the same sub's `elsif` branch). This is rubric text (an instruction, not prayed text),
  // matching its own source formatting (Rubricae.txt's `/:...:/ ` convention for rubric lines).
  return [
    `rb1960.la.sancti.11-02.nocturnus${nocturnIndex}.pater-secreto`,
    {
      key: `rb1960.la.sancti.11-02.nocturnus${nocturnIndex}.pater-secreto`,
      kind: 'rubric',
      citation: '',
      text: PATER_TOTUM_SECRETO_TEXT,
      raw_text: '/:' + PATER_TOTUM_SECRETO_TEXT + ':/',
      display_diagnostics: [],
      source: {
        repo: sourcePin.repo,
        commit: sourcePin.commit,
        path: RUBRICAE_SOURCE_REL,
        section: 'Pater totum secreto',
        appointment: {
          path: 'web/cgi-bin/horas/specmatins.pl',
          section: 'lectiones()',
          directive: '$rule =~ /Limit.*?Benedictio/i -- our [Rule] contains "Limit Benedictiones"'
        }
      }
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
      buildNocturnVersicleUnit(sourcePin, c9Sections, index + 1, nocturn.versum),
      buildPaterSecretoUnit(sourcePin, index + 1)
    ])
  ]);

  const conclusioGloriaUnit = buildConclusioGloriaUnit(sourcePin);
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
      [conclusioGloriaUnit[0]]: conclusioGloriaUnit[1],
      [conclusioUnit[0]]: conclusioUnit[1]
    }
  };
}

// Core Contract §7 -- the block role taxonomy is closed. `versicle` and `responsory` don't fit
// any of the 13 roles (not a stretch: they're not `antiphon`, not `reading`, not `prayer`) and
// become `other` with the native label kept, per §7 rule 3. `nocturn` was worse than a wrong
// role -- it was a structural container (Nocturnus I/II/III grouping psalmody/versicle/reading/
// responsory) given a block/role of its own at all, which §7 rule 1 forbids for anything that
// isn't itself a liturgical unit. Fixed the same way the Horologion lane's own `sequence`
// containers are handled (js/office-ui.js's HOR_ROLE_BY_TYPE, ~line 3556): the container gets no
// block of its own; each child block instead carries a lane-native `nocturn`/`nocturnLabel`
// passthrough field (Core Contract §6: "optional lane-native fields the lane needs to render
// correctly, which the shell passes through untouched"), so the dev-slice's own renderer can still
// show a "Nocturnus I" heading and group the blocks visually without inventing a role for it.
function buildReadingResponsoryBlocks(section, nocturnIndex, nocturnLabel) {
  const number = section.replace('Lectio', '');

  return [
    {
      role: 'reading',
      label: MATINS_READING_LABELS[section],
      nocturn: nocturnIndex,
      nocturnLabel,
      unit_refs: [`rb1960.la.sancti.11-02.${section.toLowerCase()}`]
    },
    {
      role: 'other',
      label: MATINS_RESPONSORY_LABELS[`Responsory${number}`],
      nocturn: nocturnIndex,
      nocturnLabel,
      unit_refs: [`rb1960.la.sancti.11-02.responsorium${number}`]
    }
  ];
}

function buildNocturnBlocks(nocturn, nocturnIndex) {
  return [
    {
      role: 'psalmody',
      label: 'Psalmi et antiphonae',
      nocturn: nocturnIndex,
      nocturnLabel: nocturn.label,
      unit_refs: [`rb1960.la.sancti.11-02.nocturnus${nocturnIndex}.psalmi-antiphonae`]
    },
    {
      role: 'other',
      label: 'Versiculum',
      nocturn: nocturnIndex,
      nocturnLabel: nocturn.label,
      unit_refs: [`rb1960.la.sancti.11-02.nocturnus${nocturnIndex}.versiculum`]
    },
    {
      // Placed here, before this nocturn's first Lectio, matching web/cgi-bin/horas/
      // specmatins.pl's own build order: nocturn() (psalmody+versicle) runs, then lectiones()
      // is called once per nocturn and pushes this rubric before that nocturn's own readings.
      role: 'rubric',
      label: 'Pater Noster',
      nocturn: nocturnIndex,
      nocturnLabel: nocturn.label,
      unit_refs: [`rb1960.la.sancti.11-02.nocturnus${nocturnIndex}.pater-secreto`]
    },
    ...nocturn.sections.flatMap(section => buildReadingResponsoryBlocks(section, nocturnIndex, nocturn.label))
  ];
}

function buildMatinsBlocks() {
  return [
    {
      // `invitatory` isn't in the closed taxonomy either, but unlike versicle/responsory it has
      // an exact, non-stretched fit already in §7's own prose: "opening -- Invitatory / opening
      // versicles / introductory material."
      role: 'opening',
      label: 'Invitatorium',
      unit_refs: ['rb1960.la.sancti.11-02.invitatorium']
    },
    ...MATINS_NOCTURNS.flatMap((nocturn, index) => buildNocturnBlocks(nocturn, index + 1)),
    {
      // [Conclusio]'s own `&Gloria` macro, resolved to its own doxology-role block/unit rather
      // than left as an unresolved-macro diagnostic. See buildConclusioGloriaUnit().
      role: 'doxology',
      label: 'Gloria Patri',
      unit_refs: ['rb1960.la.sancti.11-02.conclusio-doxology']
    },
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
